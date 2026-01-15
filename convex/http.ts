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

// Webhook for outbound email status updates (sent, delivered, bounced, etc.)
http.route({
  path: "/webhooks/resend/email-status",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.RESEND_WEBHOOK_EMAIL_STATUS_SECRET;

    if (!webhookSecret) {
      console.error("Missing RESEND_WEBHOOK_EMAIL_STATUS_SECRET environment variable");
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
      created_at: string;
      data: {
        email_id: string;
        bounce?: {
          type: "Permanent" | "Temporary";
          message?: string;
        };
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

    // Map event type to delivery status
    const statusMap: Record<string, "sent" | "delivered" | "delayed" | "bounced" | "complained"> = {
      "email.sent": "sent",
      "email.delivered": "delivered",
      "email.delivery_delayed": "delayed",
      "email.bounced": "bounced",
      "email.complained": "complained",
    };

    const status = statusMap[event.type];

    if (!status) {
      console.log(`Ignoring unhandled event type: ${event.type}`);
      return new Response("OK", { status: 200 });
    }

    const timestamp = event.created_at ? new Date(event.created_at).getTime() : Date.now();

    try {
      // Build bounce info for bounced events
      const bounceInfo = event.type === "email.bounced" && event.data.bounce
        ? {
            type: event.data.bounce.type === "Permanent" ? "hard" as const : "soft" as const,
            message: event.data.bounce.message,
          }
        : undefined;

      await ctx.runMutation(api.emails.updateDeliveryStatus, {
        resendId: event.data.email_id,
        status,
        timestamp,
        bounceInfo,
      });

      console.log(`Email ${event.data.email_id} status updated to: ${status}`);
    } catch (err) {
      console.error(`Failed to update email status:`, err);
      return new Response("Failed to process status update", { status: 500 });
    }

    return new Response("OK", { status: 200 });
  }),
});

export default http;
