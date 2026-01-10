import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

// Parse "Name <email@example.com>" or just "email@example.com" format
function parseEmailAddress(addr: string): { email: string; name: string } {
  const match = addr.match(/^(.+?)\s*<(.+)>$/);
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() };
  }
  // Just an email address without name
  const emailOnly = addr.trim();
  return { name: emailOnly.split("@")[0], email: emailOnly };
}

http.route({
  path: "/webhooks/resend/email-received",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.RESEND_WEBHOOK_EMAIL_RECEIVED_SECRET;

    if (!webhookSecret) {
      console.error("Missing RESEND_WEBHOOK_EMAIL_RECEIVED_SECRET environment variable");
      return new Response("Server configuration error", { status: 500 });
    }

    // Extract Svix headers for signature verification
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("Missing svix headers");
      return new Response("Missing webhook signature headers", { status: 400 });
    }

    const payload = await request.text();

    // Verify webhook signature
    const wh = new Webhook(webhookSecret);
    let event: {
      type: string;
      data: {
        email_id: string;
        from: string;
        to: string[];
        cc?: string[];
        subject: string;
        attachments?: Array<{
          id: string;
          filename: string;
          content_type: string;
        }>;
      };
    };

    try {
      event = wh.verify(payload, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as typeof event;
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return new Response("Invalid webhook signature", { status: 401 });
    }

    // Process verified event
    if (event.type === "email.received") {
      const { email_id, from, to, cc, subject, attachments } = event.data;

      try {
        await ctx.runMutation(api.emails.createFromWebhook, {
          resendId: email_id,
          from: parseEmailAddress(from),
          to: to.map((addr) => parseEmailAddress(addr)),
          cc: cc?.map((addr) => parseEmailAddress(addr)),
          subject: subject || "(No Subject)",
          timestamp: Date.now(),
          attachments: attachments?.map((a) => ({
            id: a.id,
            filename: a.filename,
            contentType: a.content_type,
          })),
        });

        console.log(`Email received and stored: ${email_id}`);
      } catch (err) {
        console.error("Failed to store email:", err);
        return new Response("Failed to process email", { status: 500 });
      }
    }

    return new Response("OK", { status: 200 });
  }),
});

export default http;
