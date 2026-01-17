import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

describe("Spam Filtering", () => {
  describe("markAsSpam", () => {
    it("should mark an email as spam", async () => {
      const t = convexTest(schema, modules);

      // Create a test email
      const emailId = await t.mutation(api.emails.createFromWebhook, {
        resendId: "test-email-1",
        from: { email: "sender@example.com", name: "Sender" },
        to: [{ email: "me@example.com", name: "Me" }],
        subject: "Test Email",
        timestamp: Date.now(),
      });

      // Mark as spam
      await t.mutation(api.emails.markAsSpam, { id: emailId, blockSender: false });

      // Verify email is marked as spam
      const email = await t.query(api.emails.getById, { id: emailId });
      expect(email?.isSpam).toBe(true);
    });

    it("should auto-block sender when blockSender is true", async () => {
      const t = convexTest(schema, modules);
      const senderEmail = "spammer@spam.com";

      // Create a test email
      const emailId = await t.mutation(api.emails.createFromWebhook, {
        resendId: "test-email-2",
        from: { email: senderEmail, name: "Spammer" },
        to: [{ email: "me@example.com", name: "Me" }],
        subject: "Spam Email",
        timestamp: Date.now(),
      });

      // Mark as spam with auto-block
      await t.mutation(api.emails.markAsSpam, { id: emailId, blockSender: true });

      // Verify sender is blocked
      const blockedSenders = await t.query(api.emails.listBlockedSenders, {});
      expect(blockedSenders.length).toBe(1);
      expect(blockedSenders[0].email).toBe(senderEmail);
      expect(blockedSenders[0].reason).toBe("Marked as spam");
    });

    it("should not duplicate blocked sender entry", async () => {
      const t = convexTest(schema, modules);
      const senderEmail = "spammer@spam.com";

      // Create two emails from same sender
      const emailId1 = await t.mutation(api.emails.createFromWebhook, {
        resendId: "test-email-3",
        from: { email: senderEmail, name: "Spammer" },
        to: [{ email: "me@example.com", name: "Me" }],
        subject: "Spam 1",
        timestamp: Date.now(),
      });

      const emailId2 = await t.mutation(api.emails.createFromWebhook, {
        resendId: "test-email-4",
        from: { email: senderEmail, name: "Spammer" },
        to: [{ email: "me@example.com", name: "Me" }],
        subject: "Spam 2",
        timestamp: Date.now() + 1000,
      });

      // Mark both as spam with auto-block
      await t.mutation(api.emails.markAsSpam, { id: emailId1, blockSender: true });
      await t.mutation(api.emails.markAsSpam, { id: emailId2, blockSender: true });

      // Verify only one blocked sender entry exists
      const blockedSenders = await t.query(api.emails.listBlockedSenders, {});
      expect(blockedSenders.length).toBe(1);
    });
  });

  describe("markAsNotSpam", () => {
    it("should restore email from spam", async () => {
      const t = convexTest(schema, modules);

      // Create a test email
      const emailId = await t.mutation(api.emails.createFromWebhook, {
        resendId: "test-email-5",
        from: { email: "sender@example.com", name: "Sender" },
        to: [{ email: "me@example.com", name: "Me" }],
        subject: "Test Email",
        timestamp: Date.now(),
      });

      // Mark as spam, then mark as not spam
      await t.mutation(api.emails.markAsSpam, { id: emailId });
      await t.mutation(api.emails.markAsNotSpam, { id: emailId });

      // Verify email is no longer spam
      const email = await t.query(api.emails.getById, { id: emailId });
      expect(email?.isSpam).toBe(false);
    });
  });

  describe("listInbox with filter", () => {
    it("should filter out spam emails by default", async () => {
      const t = convexTest(schema, modules);

      // Create regular and spam emails
      const regularEmailId = await t.mutation(api.emails.createFromWebhook, {
        resendId: "regular-email",
        from: { email: "friend@example.com", name: "Friend" },
        to: [{ email: "me@example.com", name: "Me" }],
        subject: "Regular Email",
        timestamp: Date.now(),
      });

      const spamEmailId = await t.mutation(api.emails.createFromWebhook, {
        resendId: "spam-email",
        from: { email: "spammer@spam.com", name: "Spammer" },
        to: [{ email: "me@example.com", name: "Me" }],
        subject: "Spam Email",
        timestamp: Date.now() + 1000,
      });

      // Mark one as spam
      await t.mutation(api.emails.markAsSpam, { id: spamEmailId });

      // Default filter should exclude spam
      const inbox = await t.query(api.emails.listInbox, {});
      expect(inbox.length).toBe(1);
      expect(inbox[0]._id).toEqual(regularEmailId);
    });

    it("should show only spam emails when filter is 'spam'", async () => {
      const t = convexTest(schema, modules);

      // Create regular and spam emails
      await t.mutation(api.emails.createFromWebhook, {
        resendId: "regular-email-2",
        from: { email: "friend@example.com", name: "Friend" },
        to: [{ email: "me@example.com", name: "Me" }],
        subject: "Regular Email",
        timestamp: Date.now(),
      });

      const spamEmailId = await t.mutation(api.emails.createFromWebhook, {
        resendId: "spam-email-2",
        from: { email: "spammer@spam.com", name: "Spammer" },
        to: [{ email: "me@example.com", name: "Me" }],
        subject: "Spam Email",
        timestamp: Date.now() + 1000,
      });

      // Mark one as spam
      await t.mutation(api.emails.markAsSpam, { id: spamEmailId });

      // Spam filter should only show spam
      const spamEmails = await t.query(api.emails.listInbox, { filter: "spam" });
      expect(spamEmails.length).toBe(1);
      expect(spamEmails[0]._id).toEqual(spamEmailId);
    });

    it("should show all emails when filter is 'all'", async () => {
      const t = convexTest(schema, modules);

      // Create regular and spam emails
      await t.mutation(api.emails.createFromWebhook, {
        resendId: "regular-email-3",
        from: { email: "friend@example.com", name: "Friend" },
        to: [{ email: "me@example.com", name: "Me" }],
        subject: "Regular Email",
        timestamp: Date.now(),
      });

      const spamEmailId = await t.mutation(api.emails.createFromWebhook, {
        resendId: "spam-email-3",
        from: { email: "spammer@spam.com", name: "Spammer" },
        to: [{ email: "me@example.com", name: "Me" }],
        subject: "Spam Email",
        timestamp: Date.now() + 1000,
      });

      // Mark one as spam
      await t.mutation(api.emails.markAsSpam, { id: spamEmailId });

      // All filter should show both
      const allEmails = await t.query(api.emails.listInbox, { filter: "all" });
      expect(allEmails.length).toBe(2);
    });
  });

  describe("getStats", () => {
    it("should return correct spam count", async () => {
      const t = convexTest(schema, modules);

      // Create multiple emails, some spam
      const email1 = await t.mutation(api.emails.createFromWebhook, {
        resendId: "stat-email-1",
        from: { email: "friend@example.com", name: "Friend" },
        to: [{ email: "me@example.com", name: "Me" }],
        subject: "Email 1",
        timestamp: Date.now(),
      });

      const email2 = await t.mutation(api.emails.createFromWebhook, {
        resendId: "stat-email-2",
        from: { email: "spammer1@spam.com", name: "Spammer 1" },
        to: [{ email: "me@example.com", name: "Me" }],
        subject: "Spam 1",
        timestamp: Date.now() + 1000,
      });

      const email3 = await t.mutation(api.emails.createFromWebhook, {
        resendId: "stat-email-3",
        from: { email: "spammer2@spam.com", name: "Spammer 2" },
        to: [{ email: "me@example.com", name: "Me" }],
        subject: "Spam 2",
        timestamp: Date.now() + 2000,
      });

      // Mark two as spam
      await t.mutation(api.emails.markAsSpam, { id: email2 });
      await t.mutation(api.emails.markAsSpam, { id: email3 });

      // Verify stats
      const stats = await t.query(api.emails.getStats, {});
      expect(stats.spamCount).toBe(2);
      expect(stats.totalInbox).toBe(1); // Only non-spam inbox emails
    });

    it("should exclude spam from totalInbox count", async () => {
      const t = convexTest(schema, modules);

      // Create 3 emails
      await t.mutation(api.emails.createFromWebhook, {
        resendId: "stat-email-4",
        from: { email: "friend@example.com", name: "Friend" },
        to: [{ email: "me@example.com", name: "Me" }],
        subject: "Email 1",
        timestamp: Date.now(),
      });

      await t.mutation(api.emails.createFromWebhook, {
        resendId: "stat-email-5",
        from: { email: "friend2@example.com", name: "Friend 2" },
        to: [{ email: "me@example.com", name: "Me" }],
        subject: "Email 2",
        timestamp: Date.now() + 1000,
      });

      const spamEmailId = await t.mutation(api.emails.createFromWebhook, {
        resendId: "stat-email-6",
        from: { email: "spammer@spam.com", name: "Spammer" },
        to: [{ email: "me@example.com", name: "Me" }],
        subject: "Spam",
        timestamp: Date.now() + 2000,
      });

      // Mark one as spam
      await t.mutation(api.emails.markAsSpam, { id: spamEmailId });

      // Verify inbox count excludes spam
      const stats = await t.query(api.emails.getStats, {});
      expect(stats.totalInbox).toBe(2);
      expect(stats.spamCount).toBe(1);
    });
  });

  describe("Auto-blocking incoming emails", () => {
    it("should auto-mark new emails from blocked senders as spam", async () => {
      const t = convexTest(schema, modules);
      const blockedEmail = "known-spammer@spam.com";

      // First, create an email and block the sender
      const firstEmailId = await t.mutation(api.emails.createFromWebhook, {
        resendId: "auto-block-email-1",
        from: { email: blockedEmail, name: "Known Spammer" },
        to: [{ email: "me@example.com", name: "Me" }],
        subject: "First spam",
        timestamp: Date.now(),
      });

      await t.mutation(api.emails.markAsSpam, { id: firstEmailId, blockSender: true });

      // New email from blocked sender should be auto-marked as spam
      const secondEmailId = await t.mutation(api.emails.createFromWebhook, {
        resendId: "auto-block-email-2",
        from: { email: blockedEmail, name: "Known Spammer" },
        to: [{ email: "me@example.com", name: "Me" }],
        subject: "Second spam",
        timestamp: Date.now() + 1000,
      });

      const secondEmail = await t.query(api.emails.getById, { id: secondEmailId });
      expect(secondEmail?.isSpam).toBe(true);
    });

    it("should auto-mark emails from blocked domain as spam", async () => {
      const t = convexTest(schema, modules);

      // Block a sender with domain blocking
      await t.mutation(api.emails.blockSender, {
        email: "spammer@baddomain.com",
        blockDomain: true,
        reason: "Bad domain",
      });

      // New email from different address on same domain should be spam
      const emailId = await t.mutation(api.emails.createFromWebhook, {
        resendId: "domain-block-email",
        from: { email: "otherspammer@baddomain.com", name: "Other Spammer" },
        to: [{ email: "me@example.com", name: "Me" }],
        subject: "Domain spam",
        timestamp: Date.now(),
      });

      const email = await t.query(api.emails.getById, { id: emailId });
      expect(email?.isSpam).toBe(true);
    });
  });

  describe("Unblocking senders", () => {
    it("should remove sender from blocked list", async () => {
      const t = convexTest(schema, modules);
      const senderEmail = "once-blocked@example.com";

      // Block the sender
      await t.mutation(api.emails.blockSender, {
        email: senderEmail,
        reason: "Test block",
      });

      let blockedSenders = await t.query(api.emails.listBlockedSenders, {});
      expect(blockedSenders.length).toBe(1);

      // Unblock by email
      await t.mutation(api.emails.unblockSenderByEmail, { email: senderEmail });

      blockedSenders = await t.query(api.emails.listBlockedSenders, {});
      expect(blockedSenders.length).toBe(0);
    });
  });
});
