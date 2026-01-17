import { mutation } from "./_generated/server";

/**
 * Seeds the database with test data for E2E testing.
 * ONLY use with LOCAL Convex backend - this deletes all existing data!
 */
export const seedTestData = mutation({
  args: {},
  handler: async (ctx) => {
    // Clear ALL existing data (safe because this runs on LOCAL backend only)
    const existingEmails = await ctx.db.query("emails").collect();
    for (const email of existingEmails) {
      await ctx.db.delete(email._id);
    }

    const existingBlockedSenders = await ctx.db
      .query("blockedSenders")
      .collect();
    for (const blocked of existingBlockedSenders) {
      await ctx.db.delete(blocked._id);
    }

    // Create test inbox emails
    const testEmails = [
      {
        resendId: "test-email-inbox-1",
        from: { email: "alice@example.com", name: "Alice Smith" },
        to: [{ email: "me@yumail.com", name: "Me" }],
        subject: "Welcome to the team!",
        timestamp: Date.now() - 3600000, // 1 hour ago
        isRead: false,
        folder: "inbox" as const,
        isSpam: false,
      },
      {
        resendId: "test-email-inbox-2",
        from: { email: "bob@example.com", name: "Bob Johnson" },
        to: [{ email: "me@yumail.com", name: "Me" }],
        subject: "Project update - Q1 review",
        timestamp: Date.now() - 7200000, // 2 hours ago
        isRead: true,
        folder: "inbox" as const,
        isSpam: false,
      },
      {
        resendId: "test-email-inbox-3",
        from: { email: "carol@example.com", name: "Carol Williams" },
        to: [{ email: "me@yumail.com", name: "Me" }],
        subject: "Meeting tomorrow at 2pm",
        timestamp: Date.now() - 10800000, // 3 hours ago
        isRead: false,
        folder: "inbox" as const,
        isSpam: false,
      },
      {
        resendId: "test-email-inbox-4",
        from: { email: "david@example.com", name: "David Brown" },
        to: [{ email: "me@yumail.com", name: "Me" }],
        subject: "Invoice attached",
        timestamp: Date.now() - 14400000, // 4 hours ago
        isRead: true,
        folder: "inbox" as const,
        isSpam: false,
      },
      {
        resendId: "test-email-inbox-5",
        from: { email: "eve@example.com", name: "Eve Davis" },
        to: [{ email: "me@yumail.com", name: "Me" }],
        subject: "Quick question about the API",
        timestamp: Date.now() - 18000000, // 5 hours ago
        isRead: false,
        folder: "inbox" as const,
        isSpam: false,
      },
    ];

    // Create test sent emails
    const sentEmails = [
      {
        resendId: "test-email-sent-1",
        from: { email: "me@yumail.com", name: "Me" },
        to: [{ email: "alice@example.com", name: "Alice Smith" }],
        subject: "Re: Welcome to the team!",
        timestamp: Date.now() - 1800000, // 30 min ago
        isRead: true,
        folder: "sent" as const,
        isSpam: false,
        deliveryStatus: "delivered" as const,
      },
      {
        resendId: "test-email-sent-2",
        from: { email: "me@yumail.com", name: "Me" },
        to: [{ email: "bob@example.com", name: "Bob Johnson" }],
        subject: "Re: Project update - Q1 review",
        timestamp: Date.now() - 5400000, // 1.5 hours ago
        isRead: true,
        folder: "sent" as const,
        isSpam: false,
        deliveryStatus: "sent" as const,
      },
    ];

    // Insert all test data
    for (const email of [...testEmails, ...sentEmails]) {
      await ctx.db.insert("emails", email);
    }

    return {
      inboxCount: testEmails.length,
      sentCount: sentEmails.length,
      message: "Test data seeded successfully",
    };
  },
});

/**
 * Clears all test data from the database.
 * ONLY use with LOCAL Convex backend!
 */
export const clearTestData = mutation({
  args: {},
  handler: async (ctx) => {
    const emails = await ctx.db.query("emails").collect();
    for (const email of emails) {
      await ctx.db.delete(email._id);
    }

    const blockedSenders = await ctx.db.query("blockedSenders").collect();
    for (const blocked of blockedSenders) {
      await ctx.db.delete(blocked._id);
    }

    return { message: "Test data cleared successfully" };
  },
});
