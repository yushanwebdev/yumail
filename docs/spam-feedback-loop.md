# Spam Feedback Loop Implementation

This document describes how spam reporting works in email systems and the implementation options for yumail.

## Background: How Email Spam Reporting Works

### Outbound Emails (Already Implemented)

When you send an email and the recipient marks it as spam:

1. Recipient clicks "Report Spam" in their email client (Gmail, Outlook, etc.)
2. The email provider records this action
3. Provider sends an **ARF (Abuse Reporting Format)** report to the sender's email service via **Feedback Loops (FBL)**
4. Resend receives this report and fires an `email.complained` webhook
5. yumail stores this as `deliveryStatus: "complained"` on the sent email

This is already handled in `convex/http.ts` via the `email.complained` event.

### Inbound Emails (To Be Implemented)

When a user marks a received email as spam in yumail, we can optionally notify the sender's email service. This helps maintain email ecosystem health and may reduce future spam.

## Implementation Options

### Option 1: ARF Report via Email (Recommended)

Send an abuse report email to the sender's domain when a user marks an email as spam.

**How it works:**
1. User marks email as spam in yumail
2. Extract sender's domain from the `from` address
3. Send an ARF-formatted email to `abuse@{sender-domain}`
4. Most domains have an abuse contact that processes these reports

**Pros:**
- Simple to implement
- Works with most email providers
- Industry-standard approach

**Cons:**
- Not all domains monitor their abuse address
- Requires sending an outbound email

**Implementation:**

```typescript
// convex/emails.ts
export const markAsSpam = mutation({
  args: { id: v.id("emails") },
  handler: async (ctx, args) => {
    const email = await ctx.db.get(args.id);
    if (!email) return;

    await ctx.db.patch(args.id, { isSpam: true });

    // Optionally trigger ARF report
    // await ctx.scheduler.runAfter(0, api.emails.sendSpamReport, {
    //   emailId: args.id,
    //   senderDomain: extractDomain(email.from.email),
    // });
  },
});
```

**ARF Report Format:**

```
From: abuse@yourdomain.com
To: abuse@sender-domain.com
Subject: spam report
Content-Type: multipart/report; report-type=feedback-report

--boundary
Content-Type: text/plain

This is a spam report for an email received by our user.

--boundary
Content-Type: message/feedback-report

Feedback-Type: abuse
User-Agent: yumail/1.0
Version: 1
Original-Mail-From: spammer@sender-domain.com
Arrival-Date: Thu, 16 Jan 2025 10:00:00 -0000

--boundary
Content-Type: message/rfc822

[Original email headers here]

--boundary--
```

### Option 2: DNS-Based FBL Lookup

Look up the sender's FBL endpoint via DNS and send a report directly.

**How it works:**
1. Query DNS for `_feedback@{sender-domain}` TXT record
2. Parse the FBL endpoint URL from the record
3. POST the ARF report to that endpoint

**Pros:**
- More accurate delivery to the right FBL processor
- Faster processing than email-based reports

**Cons:**
- Complex to implement
- Many domains don't publish FBL DNS records
- Requires HTTP POST capability from backend

### Option 3: Local Blocking Only

Simply block future emails from the sender without external notification.

**How it works:**
1. User marks email as spam
2. Add sender to a blocklist
3. Filter out emails from blocked senders on arrival

**Implementation:**

```typescript
// convex/schema.ts - Add blocklist table
blockedSenders: defineTable({
  email: v.string(),
  domain: v.optional(v.string()),
  blockedAt: v.number(),
  reason: v.optional(v.string()),
}).index("by_email", ["email"])
  .index("by_domain", ["domain"]),

// convex/emails.ts - Check blocklist on email arrival
export const createFromWebhook = mutation({
  // ... existing args
  handler: async (ctx, args) => {
    // Check if sender is blocked
    const blocked = await ctx.db
      .query("blockedSenders")
      .withIndex("by_email", (q) => q.eq("email", args.from.email))
      .first();

    if (blocked) {
      // Silently discard or auto-mark as spam
      return null;
    }

    // ... rest of existing logic
  },
});
```

**Pros:**
- Simplest to implement
- No external dependencies
- Immediate effect

**Cons:**
- Doesn't notify sender (they may continue sending)
- Doesn't contribute to global spam reporting

## Recommendation

For a personal email app like yumail, **Option 3 (Local Blocking)** is the most practical starting point:

1. Quick to implement
2. Provides immediate user benefit
3. No risk of misconfigured abuse reports

If spam becomes a significant issue, **Option 1 (ARF via Email)** can be added later to participate in the broader email ecosystem's spam reporting.

## Current Implementation Status

- [x] `isSpam` field added to emails schema
- [x] `markAsSpam` and `markAsNotSpam` mutations
- [x] Spam emails filtered from inbox queries
- [x] Stats exclude spam emails
- [x] Sender blocklist (Option 3)
  - [x] `blockedSenders` table in schema
  - [x] `blockSender` mutation (with optional domain blocking)
  - [x] `unblockSender` and `unblockSenderByEmail` mutations
  - [x] `listBlockedSenders` query
  - [x] `markAsSpam` now accepts `blockSender` option
  - [x] `createFromWebhook` auto-marks blocked senders as spam
- [ ] ARF report sending (Option 1)

## API Reference

### Mutations

```typescript
// Mark email as spam (optionally block sender)
markAsSpam({ id: Id<"emails">, blockSender?: boolean })

// Remove spam flag
markAsNotSpam({ id: Id<"emails"> })

// Block a sender directly
blockSender({ email: string, blockDomain?: boolean, reason?: string })

// Unblock by ID
unblockSender({ id: Id<"blockedSenders"> })

// Unblock by email address
unblockSenderByEmail({ email: string })
```

### Queries

```typescript
// List all blocked senders
listBlockedSenders() => BlockedSender[]

// Inbox emails (spam filtered out)
listInbox() => Email[]

// Unread emails (spam filtered out)
listUnread() => Email[]
```

### Schema

```typescript
// blockedSenders table
{
  email: string,        // Blocked email address
  domain?: string,      // If set, blocks entire domain
  blockedAt: number,    // Unix timestamp
  reason?: string,      // Why it was blocked
}
```

## References

- [ARF RFC 5965](https://datatracker.ietf.org/doc/html/rfc5965) - Abuse Reporting Format specification
- [FBL Best Practices](https://www.m3aawg.org/sites/default/files/m3aawg_feedback_loop_bcp-2015-12.pdf) - M3AAWG Feedback Loop Best Practices
- [Resend Webhooks](https://resend.com/docs/dashboard/webhooks/event-types) - Resend webhook event types
