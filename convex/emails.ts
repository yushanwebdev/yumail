import { v } from "convex/values";
import { query, mutation, internalMutation, QueryCtx, MutationCtx } from "./_generated/server";

// Helper to require authentication
async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }
  return identity;
}

// ============ QUERIES ============

export const listInbox = query({
  args: {
    filter: v.optional(v.union(v.literal("all"), v.literal("spam"))),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const emails = await ctx.db
      .query("emails")
      .withIndex("by_folder_timestamp", (q) => q.eq("folder", "inbox"))
      .order("desc")
      .collect();

    // Apply filter
    if (args.filter === "spam") {
      return emails.filter((e) => e.isSpam);
    }
    if (args.filter === "all") {
      return emails;
    }
    // Default: filter out spam emails
    return emails.filter((e) => !e.isSpam);
  },
});

export const listSent = query({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    const emails = await ctx.db
      .query("emails")
      .withIndex("by_folder_timestamp", (q) => q.eq("folder", "sent"))
      .order("desc")
      .collect();
    return emails;
  },
});

export const listUnread = query({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    const emails = await ctx.db
      .query("emails")
      .withIndex("by_folder_isRead", (q) =>
        q.eq("folder", "inbox").eq("isRead", false)
      )
      .order("desc")
      .collect();
    // Filter out spam emails
    return emails.filter((e) => !e.isSpam);
  },
});

export const getById = query({
  args: { id: v.id("emails") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db.get(args.id);
  },
});

export const getByResendId = query({
  args: { resendId: v.string() },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db
      .query("emails")
      .withIndex("by_resendId", (q) => q.eq("resendId", args.resendId))
      .first();
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    const allEmails = await ctx.db.query("emails").collect();

    // Exclude spam from inbox stats
    const inbox = allEmails.filter((e) => e.folder === "inbox" && !e.isSpam);
    const spam = allEmails.filter((e) => e.folder === "inbox" && e.isSpam);
    const sent = allEmails.filter((e) => e.folder === "sent");
    const unread = inbox.filter((e) => !e.isRead);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    const todayCount = inbox.filter((e) => e.timestamp >= todayTimestamp).length;

    return {
      totalInbox: inbox.length,
      totalSent: sent.length,
      unreadCount: unread.length,
      todayCount,
      spamCount: spam.length,
    };
  },
});

export const getSenderBreakdown = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const limit = args.limit ?? 5;
    const allInboxEmails = await ctx.db
      .query("emails")
      .withIndex("by_folder_timestamp", (q) => q.eq("folder", "inbox"))
      .collect();
    // Exclude spam from sender breakdown
    const inboxEmails = allInboxEmails.filter((e) => !e.isSpam);

    // Count emails per sender
    const senderCounts = new Map<string, { email: string; name: string; count: number }>();

    for (const email of inboxEmails) {
      const key = email.from.email;
      const existing = senderCounts.get(key);
      if (existing) {
        existing.count++;
      } else {
        senderCounts.set(key, {
          email: email.from.email,
          name: email.from.name,
          count: 1,
        });
      }
    }

    // Sort by count and take top N
    const sorted = Array.from(senderCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return sorted;
  },
});

// ============ MUTATIONS ============

// Internal mutation - only callable from server-side code (HTTP actions).
// Svix signature verification happens in convex/http.ts before calling this.
export const createFromWebhook = internalMutation({
  args: {
    resendId: v.string(),
    from: v.object({ email: v.string(), name: v.string() }),
    to: v.array(v.object({ email: v.string(), name: v.string() })),
    cc: v.optional(v.array(v.object({ email: v.string(), name: v.string() }))),
    subject: v.string(),
    timestamp: v.number(),
    attachments: v.optional(
      v.array(
        v.object({
          id: v.string(),
          filename: v.string(),
          contentType: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    // Check if email already exists (prevent duplicates)
    const existing = await ctx.db
      .query("emails")
      .withIndex("by_resendId", (q) => q.eq("resendId", args.resendId))
      .first();

    if (existing) {
      return existing._id;
    }

    // Check if sender is blocked
    const senderEmail = args.from.email;
    const senderDomain = senderEmail.split("@")[1];

    const blockedByEmail = await ctx.db
      .query("blockedSenders")
      .withIndex("by_email", (q) => q.eq("email", senderEmail))
      .first();

    const blockedByDomain = await ctx.db
      .query("blockedSenders")
      .withIndex("by_domain", (q) => q.eq("domain", senderDomain))
      .first();

    const isBlocked = !!blockedByEmail || !!blockedByDomain;

    const emailId = await ctx.db.insert("emails", {
      resendId: args.resendId,
      from: args.from,
      to: args.to,
      cc: args.cc,
      subject: args.subject,
      timestamp: args.timestamp,
      isRead: false,
      isSpam: isBlocked, // Auto-mark as spam if sender is blocked
      folder: "inbox",
      attachments: args.attachments,
    });

    return emailId;
  },
});

export const createSent = mutation({
  args: {
    resendId: v.string(),
    from: v.object({ email: v.string(), name: v.string() }),
    to: v.array(v.object({ email: v.string(), name: v.string() })),
    cc: v.optional(v.array(v.object({ email: v.string(), name: v.string() }))),
    subject: v.string(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const emailId = await ctx.db.insert("emails", {
      resendId: args.resendId,
      from: args.from,
      to: args.to,
      cc: args.cc,
      subject: args.subject,
      timestamp: args.timestamp,
      isRead: true, // Sent emails are always "read"
      folder: "sent",
      deliveryStatus: "queued",
      statusHistory: [
        {
          status: "queued",
          timestamp: args.timestamp,
        },
      ],
    });

    return emailId;
  },
});

export const markAsRead = mutation({
  args: { id: v.id("emails") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    await ctx.db.patch(args.id, { isRead: true });
  },
});

export const markAsUnread = mutation({
  args: { id: v.id("emails") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    await ctx.db.patch(args.id, { isRead: false });
  },
});

export const markAsSpam = mutation({
  args: {
    id: v.id("emails"),
    blockSender: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const email = await ctx.db.get(args.id);
    if (!email) return;

    await ctx.db.patch(args.id, { isSpam: true });

    // Optionally block the sender
    if (args.blockSender) {
      const senderEmail = email.from.email;
      const domain = senderEmail.split("@")[1];

      // Check if already blocked
      const existing = await ctx.db
        .query("blockedSenders")
        .withIndex("by_email", (q) => q.eq("email", senderEmail))
        .first();

      if (!existing) {
        await ctx.db.insert("blockedSenders", {
          email: senderEmail,
          domain,
          blockedAt: Date.now(),
          reason: "Marked as spam",
        });
      }
    }
  },
});

export const markAsNotSpam = mutation({
  args: { id: v.id("emails") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    await ctx.db.patch(args.id, { isSpam: false });
  },
});

export const deleteEmail = mutation({
  args: { id: v.id("emails") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    await ctx.db.delete(args.id);
  },
});

// Internal mutation - only callable from server-side code (HTTP actions).
// Svix signature verification happens in convex/http.ts before calling this.
export const updateDeliveryStatus = internalMutation({
  args: {
    resendId: v.string(),
    status: v.union(
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("delayed"),
      v.literal("bounced"),
      v.literal("complained")
    ),
    timestamp: v.number(),
    bounceInfo: v.optional(
      v.object({
        type: v.union(v.literal("hard"), v.literal("soft")),
        message: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const email = await ctx.db
      .query("emails")
      .withIndex("by_resendId", (q) => q.eq("resendId", args.resendId))
      .first();

    if (!email) {
      console.warn(`Email not found for resendId: ${args.resendId}`);
      return null;
    }

    // Build status history entry
    const historyEntry: {
      status: string;
      timestamp: number;
      details?: string;
    } = {
      status: args.status,
      timestamp: args.timestamp,
    };

    if (args.bounceInfo?.message) {
      historyEntry.details = args.bounceInfo.message;
    }

    // Append to existing history
    const statusHistory = [...(email.statusHistory || []), historyEntry];

    // Update the email record
    await ctx.db.patch(email._id, {
      deliveryStatus: args.status,
      ...(args.bounceInfo && { bounceInfo: args.bounceInfo }),
      statusHistory,
    });

    return email._id;
  },
});

// ============ BLOCKED SENDERS ============

export const listBlockedSenders = query({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    return await ctx.db.query("blockedSenders").collect();
  },
});

export const blockSender = mutation({
  args: {
    email: v.string(),
    blockDomain: v.optional(v.boolean()),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const domain = args.email.split("@")[1];

    // Check if already blocked
    const existing = await ctx.db
      .query("blockedSenders")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("blockedSenders", {
      email: args.email,
      domain: args.blockDomain ? domain : undefined,
      blockedAt: Date.now(),
      reason: args.reason,
    });
  },
});

export const unblockSender = mutation({
  args: { id: v.id("blockedSenders") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    await ctx.db.delete(args.id);
  },
});

export const unblockSenderByEmail = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const blocked = await ctx.db
      .query("blockedSenders")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (blocked) {
      await ctx.db.delete(blocked._id);
    }
  },
});