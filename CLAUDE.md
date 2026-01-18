# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev      # Start dev server (port 3000)
bun run build    # Production build
bun run lint     # ESLint check
npx convex dev   # Start Convex dev server (required for backend)

# Testing
npx playwright test              # Run E2E tests (requires local Convex)
docker compose -f docker-compose.test.yml up -d  # Start local Convex for tests
```

## Architecture

**Stack:** Next.js 16 (App Router) + Convex (BaaS) + Resend (email) + shadcn/ui + Tailwind CSS v4

### Data Flow

1. **Incoming emails:** Resend webhook → `convex/http.ts` → validates with Svix → stores via `createFromWebhook` mutation
2. **Sending emails:** `/api/email/send` route → Resend API → stores metadata via `createSent` mutation
3. **Viewing content:** `/api/email/content/[id]` fetches full HTML/text from Resend (not stored in Convex)
4. **Delivery status:** Resend webhook → `/webhooks/resend/email-status` → updates via `updateDeliveryStatus` mutation

### Key Directories

- `/app` - Next.js pages (all client components)
- `/convex` - Backend: schema, queries, mutations, HTTP routes
- `/components/ui` - shadcn/ui components
- `/lib` - ConvexClientProvider, types, utilities

### Convex Backend

- **Queries:** `listInbox`, `listSent`, `listUnread`, `getById`, `getByResendId`, `getStats`, `getSenderBreakdown`
- **Mutations:** `createFromWebhook`, `createSent`, `markAsRead`, `markAsUnread`, `deleteEmail`, `updateDeliveryStatus`
- Uses real-time subscriptions via `useQuery()` hook

### Database Schema (emails table)

```
resendId, from, to[], cc[]?, subject, timestamp, isRead, folder ("inbox"|"sent"), attachments[]?,
deliveryStatus? ("queued"|"sent"|"delivered"|"delayed"|"bounced"|"complained"),
bounceInfo? { type, message? }, statusHistory[]? { status, timestamp, details? }
```

Indexes: `by_folder_timestamp`, `by_resendId`, `by_folder_isRead`, `by_deliveryStatus`

## Environment Variables

- `NEXT_PUBLIC_CONVEX_URL` - Convex deployment URL
- `RESEND_API_KEY` - Resend API key
- `RESEND_WEBHOOK_EMAIL_RECEIVED_SECRET` - Webhook signature verification (inbound emails)
- `RESEND_WEBHOOK_EMAIL_STATUS_SECRET` - Webhook signature verification (delivery status)

## Testing

E2E tests run against a local Convex backend (Docker) to ensure isolation from production data.

**Key patterns:**
- Use `data-*` attributes for test selectors (not CSS classes or arbitrary timeouts)
- Wait for explicit state changes: `await expect(page.locator('[data-view="spam"]')).toBeVisible()`
- Test data is seeded/cleared via `convex/testSeed.ts`

See [docs/TESTING.md](docs/TESTING.md) for comprehensive testing documentation.
