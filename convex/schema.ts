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
    folder: v.union(v.literal("inbox"), v.literal("sent")),

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
    .index("by_folder_isRead", ["folder", "isRead"]),
});
