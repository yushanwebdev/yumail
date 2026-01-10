# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev      # Start dev server (port 3000)
bun run build    # Production build
bun run lint     # ESLint check
npx convex dev   # Start Convex dev server (required for backend)
```

## Architecture

**Stack:** Next.js 16 (App Router) + Convex (BaaS) + Resend (email) + shadcn/ui + Tailwind CSS v4

### Data Flow

1. **Incoming emails:** Resend webhook → `convex/http.ts` → validates with Svix → stores via `createFromWebhook` mutation
2. **Sending emails:** `/api/email/send` route → Resend API → stores metadata via `createSent` mutation
3. **Viewing content:** `/api/email/content/[id]` fetches full HTML/text from Resend (not stored in Convex)

### Key Directories

- `/app` - Next.js pages (all client components)
- `/convex` - Backend: schema, queries, mutations, HTTP routes
- `/components/ui` - shadcn/ui components
- `/lib` - ConvexClientProvider, types, utilities

### Convex Backend

- **Queries:** `listInbox`, `listSent`, `listUnread`, `getById`, `getByResendId`, `getStats`, `getSenderBreakdown`
- **Mutations:** `createFromWebhook`, `createSent`, `markAsRead`, `markAsUnread`, `deleteEmail`
- Uses real-time subscriptions via `useQuery()` hook

### Database Schema (emails table)

```
resendId, from, to[], cc[]?, subject, timestamp, isRead, folder ("inbox"|"sent"), attachments[]?
```

Indexes: `by_folder_timestamp`, `by_resendId`, `by_folder_isRead`

## Environment Variables

- `NEXT_PUBLIC_CONVEX_URL` - Convex deployment URL
- `RESEND_API_KEY` - Resend API key
- `RESEND_WEBHOOK_EMAIL_RECEIVED_SECRET` - Webhook signature verification
