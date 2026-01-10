import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ============ QUERIES ============

export const listInbox = query({
  args: {},
  handler: async (ctx) => {
    const emails = await ctx.db
      .query("emails")
      .withIndex("by_folder_timestamp", (q) => q.eq("folder", "inbox"))
      .order("desc")
      .collect();
    return emails;
  },
});

export const listSent = query({
  args: {},
  handler: async (ctx) => {
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
    const emails = await ctx.db
      .query("emails")
      .withIndex("by_folder_isRead", (q) =>
        q.eq("folder", "inbox").eq("isRead", false)
      )
      .order("desc")
      .collect();
    return emails;
  },
});

export const getById = query({
  args: { id: v.id("emails") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByResendId = query({
  args: { resendId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emails")
      .withIndex("by_resendId", (q) => q.eq("resendId", args.resendId))
      .first();
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const allEmails = await ctx.db.query("emails").collect();

    const inbox = allEmails.filter((e) => e.folder === "inbox");
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
    };
  },
});

export const getSenderBreakdown = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 5;
    const inboxEmails = await ctx.db
      .query("emails")
      .withIndex("by_folder_timestamp", (q) => q.eq("folder", "inbox"))
      .collect();

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

export const createFromWebhook = mutation({
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

    const emailId = await ctx.db.insert("emails", {
      resendId: args.resendId,
      from: args.from,
      to: args.to,
      cc: args.cc,
      subject: args.subject,
      timestamp: args.timestamp,
      isRead: false,
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
    const emailId = await ctx.db.insert("emails", {
      resendId: args.resendId,
      from: args.from,
      to: args.to,
      cc: args.cc,
      subject: args.subject,
      timestamp: args.timestamp,
      isRead: true, // Sent emails are always "read"
      folder: "sent",
    });

    return emailId;
  },
});

export const markAsRead = mutation({
  args: { id: v.id("emails") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isRead: true });
  },
});

export const markAsUnread = mutation({
  args: { id: v.id("emails") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isRead: false });
  },
});

export const deleteEmail = mutation({
  args: { id: v.id("emails") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
