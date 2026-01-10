# YuMail

A modern, real-time email client built with Next.js and Convex. Send and receive emails with a clean, responsive interface.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Convex](https://img.shields.io/badge/Convex-1.31-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## Features

- **Real-time inbox** - Emails appear instantly via Convex subscriptions
- **Send & receive** - Full email functionality powered by Resend
- **Dashboard** - Stats overview with unread count, top senders, and quick actions
- **Modern UI** - Built with shadcn/ui components and smooth animations

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4
- **Backend:** Convex (real-time database & functions)
- **Email:** Resend (transactional email API)
- **UI:** shadcn/ui, Lucide icons, Motion animations

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- [Convex account](https://convex.dev/)
- [Resend account](https://resend.com/) with a verified domain

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yushanwebdev/yumail.git
   cd yumail
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Fill in the required values:

   ```
   NEXT_PUBLIC_CONVEX_URL=your_convex_url
   CONVEX_DEPLOYMENT=your_deployment
   RESEND_API_KEY=your_resend_api_key
   RESEND_WEBHOOK_EMAIL_RECEIVED_SECRET=your_webhook_secret
   ```

4. Start Convex development server:

   ```bash
   npx convex dev
   ```

5. In a new terminal, start the Next.js dev server:

   ```bash
   bun run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

### Webhook Setup

To receive emails, configure a Resend webhook pointing to:

```
https://your-convex-deployment.convex.site/webhooks/resend/email-received
```

## Project Structure

```
/app
  /api/email          # API routes for sending emails & fetching content
  /compose            # Email composition page
  /received           # Inbox view
  /sent               # Sent emails view
  page.tsx            # Dashboard

/convex
  schema.ts           # Database schema
  emails.ts           # Queries & mutations
  http.ts             # Webhook handler

/components
  /ui                 # shadcn/ui components
  email-list.tsx      # Reusable email list component

/lib
  convex.tsx          # Convex provider setup
  types.ts            # TypeScript interfaces
  utils.ts            # Helper functions
```

## Available Scripts

| Command          | Description              |
| ---------------- | ------------------------ |
| `bun run dev`    | Start development server |
| `bun run build`  | Build for production     |
| `bun run start`  | Start production server  |
| `bun run lint`   | Run ESLint               |
| `npx convex dev` | Start Convex dev server  |

## License

MIT
