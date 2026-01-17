import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  emails: defineTable({
    // Resend email ID (for fetching full content)
    resendId: v.string(),

    // Sender/recipient info
    from: v.object({ email: v.string(), name: v.string() }),
    to: v.array(v.object({ email: v.string(), name: v.string() })),
    cc: v.optional(v.array(v.object({ email: v.string(), name: v.string() }))),

    // Email metadata
    subject: v.string(),
    timestamp: v.number(), // Unix ms

    // Status
    isRead: v.boolean(),
    isSpam: v.optional(v.boolean()),
    folder: v.union(v.literal("inbox"), v.literal("sent")),

    // Delivery status (for sent emails)
    deliveryStatus: v.optional(
      v.union(
        v.literal("queued"),
        v.literal("sent"),
        v.literal("delivered"),
        v.literal("delayed"),
        v.literal("bounced"),
        v.literal("complained")
      )
    ),

    // Bounce details (only populated on bounce)
    bounceInfo: v.optional(
      v.object({
        type: v.union(v.literal("hard"), v.literal("soft")),
        message: v.optional(v.string()),
      })
    ),

    // Timeline history for detail view
    statusHistory: v.optional(
      v.array(
        v.object({
          status: v.string(),
          timestamp: v.number(),
          details: v.optional(v.string()),
        })
      )
    ),

    // Attachments metadata (not content)
    attachments: v.optional(
      v.array(
        v.object({
          id: v.string(),
          filename: v.string(),
          contentType: v.string(),
        })
      )
    ),
  })
    .index("by_folder_timestamp", ["folder", "timestamp"])
    .index("by_resendId", ["resendId"])
    .index("by_folder_isRead", ["folder", "isRead"])
    .index("by_deliveryStatus", ["folder", "deliveryStatus"]),

  blockedSenders: defineTable({
    email: v.string(),
    domain: v.optional(v.string()),
    blockedAt: v.number(),
    reason: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_domain", ["domain"]),
});
