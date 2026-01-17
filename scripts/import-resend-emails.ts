/**
 * Script to import all emails (received + sent) from Resend into Convex
 * Run with: npx tsx scripts/import-resend-emails.ts
 * Add --clear to clear existing emails before import
 */

import { Resend } from "resend";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://coordinated-koala-881.convex.cloud";
const CLEAR_BEFORE_IMPORT = process.argv.includes("--clear");

if (!RESEND_API_KEY) {
  console.error("Missing RESEND_API_KEY environment variable");
  process.exit(1);
}

const resend = new Resend(RESEND_API_KEY);
const convex = new ConvexHttpClient(CONVEX_URL);

interface ResendReceivedEmail {
  id: string;
  from: string;
  to: string[];
  subject: string;
  created_at: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    id: string;
    filename: string;
    content_type: string;
  }>;
}

interface ResendSentEmail {
  id: string;
  from: string;
  to: string[];
  subject: string;
  created_at: string;
  cc?: string[];
  bcc?: string[];
}

/**
 * Parse email address from formats like:
 * - "email@example.com"
 * - "Name <email@example.com>"
 * - "<email@example.com>"
 */
function parseEmailAddress(input: string): { email: string; name: string } {
  const trimmed = input.trim();

  // Check if it has angle brackets: "Name <email>" or "<email>"
  const bracketMatch = trimmed.match(/^(.+?)\s*<([^<>]+@[^<>]+)>$/);
  if (bracketMatch) {
    return {
      email: bracketMatch[2].trim(),
      name: bracketMatch[1].trim() || bracketMatch[2].split("@")[0],
    };
  }

  // Check for just "<email>"
  const justBracketMatch = trimmed.match(/^<([^<>]+@[^<>]+)>$/);
  if (justBracketMatch) {
    const email = justBracketMatch[1].trim();
    return { email, name: email.split("@")[0] };
  }

  // Plain email address
  if (trimmed.includes("@")) {
    return { email: trimmed, name: trimmed.split("@")[0] };
  }

  // Fallback
  return { email: trimmed, name: trimmed };
}

async function fetchReceivedEmails(): Promise<ResendReceivedEmail[]> {
  console.log("\n📥 Fetching received emails...");
  let allEmails: ResendReceivedEmail[] = [];
  let hasMore = true;
  let afterId: string | undefined;

  while (hasMore) {
    const params: { limit?: number; after?: string } = { limit: 100 };
    if (afterId) {
      params.after = afterId;
    }

    const { data, error } = await resend.emails.receiving.list(params);

    if (error) {
      console.error("Error fetching received emails from Resend:", error);
      process.exit(1);
    }

    if (data && data.data) {
      allEmails = [...allEmails, ...data.data];
      hasMore = data.has_more || false;

      if (data.data.length > 0) {
        afterId = data.data[data.data.length - 1].id;
      } else {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

  console.log(`  Found ${allEmails.length} received emails`);
  return allEmails;
}

async function fetchSentEmails(): Promise<ResendSentEmail[]> {
  console.log("\n📤 Fetching sent emails...");
  let allEmails: ResendSentEmail[] = [];

  // Resend emails.list() doesn't support pagination the same way
  // It returns emails sent via the API
  const { data, error } = await resend.emails.list();

  if (error) {
    console.error("Error fetching sent emails from Resend:", error);
    process.exit(1);
  }

  if (data && data.data) {
    allEmails = data.data;
  }

  console.log(`  Found ${allEmails.length} sent emails`);
  return allEmails;
}

async function importEmails() {
  console.log("Importing emails from Resend...");
  console.log(`Using Convex URL: ${CONVEX_URL}`);

  // Optionally clear existing emails before import
  if (CLEAR_BEFORE_IMPORT) {
    console.log("\n⚠️  --clear flag detected. Clearing existing emails...");
    try {
      await convex.mutation(api.testSeed.clearTestData, {});
      console.log("✓ Existing emails cleared.");
    } catch (err: any) {
      console.error("Failed to clear existing emails:", err.message);
      process.exit(1);
    }
  }

  // Fetch both received and sent emails
  const receivedEmails = await fetchReceivedEmails();
  const sentEmails = await fetchSentEmails();

  // Combine and sort all emails chronologically (oldest first)
  type EmailWithFolder = {
    id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    cc?: string[];
    folder: "inbox" | "sent";
    attachments?: Array<{ id: string; filename: string; content_type: string }>;
  };

  const allEmails: EmailWithFolder[] = [
    ...receivedEmails.map((e) => ({ ...e, folder: "inbox" as const })),
    ...sentEmails.map((e) => ({ ...e, folder: "sent" as const })),
  ];

  console.log(`\nTotal emails to import: ${allEmails.length} (${receivedEmails.length} received, ${sentEmails.length} sent)`);

  if (allEmails.length === 0) {
    console.log("No emails to import.");
    return;
  }

  // Sort by created_at ascending (oldest first)
  allEmails.sort((a, b) => {
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  console.log("Emails sorted chronologically (oldest first, newest last)\n");

  // Import each email into Convex
  let importedInbox = 0;
  let importedSent = 0;
  let skipped = 0;
  let failed = 0;

  for (const email of allEmails) {
    try {
      const fromParsed = parseEmailAddress(email.from);
      const toAddresses = email.to.map((to) => parseEmailAddress(to));
      const ccAddresses = email.cc?.map((cc) => parseEmailAddress(cc));

      if (email.folder === "inbox") {
        // Map attachments for received emails
        const attachments = email.attachments?.map((att) => ({
          id: att.id,
          filename: att.filename,
          contentType: att.content_type,
        }));

        await convex.mutation(api.emails.createFromWebhook, {
          resendId: email.id,
          from: fromParsed,
          to: toAddresses,
          cc: ccAddresses,
          subject: email.subject || "(No Subject)",
          timestamp: new Date(email.created_at).getTime(),
          attachments,
        });
        importedInbox++;
        console.log(`✓ [INBOX] ${email.subject?.substring(0, 50) || "(No Subject)"}`);
      } else {
        // Create sent email
        await convex.mutation(api.emails.createSent, {
          resendId: email.id,
          from: fromParsed,
          to: toAddresses,
          cc: ccAddresses,
          subject: email.subject || "(No Subject)",
          timestamp: new Date(email.created_at).getTime(),
        });
        importedSent++;
        console.log(`✓ [SENT]  ${email.subject?.substring(0, 50) || "(No Subject)"}`);
      }
    } catch (err: any) {
      if (err.message?.includes("already exists") || err.message?.includes("duplicate")) {
        skipped++;
        console.log(`⊖ Skipped: ${email.subject?.substring(0, 50) || "(No Subject)"}`);
      } else {
        failed++;
        console.error(`✗ Failed: ${email.subject?.substring(0, 50) || "(No Subject)"} - ${err.message}`);
      }
    }
  }

  console.log("\n========== Import Complete ==========");
  console.log(`Imported inbox: ${importedInbox}`);
  console.log(`Imported sent:  ${importedSent}`);
  console.log(`Skipped:        ${skipped}`);
  console.log(`Failed:         ${failed}`);
  console.log(`Total:          ${allEmails.length}`);
}

importEmails().catch(console.error);
