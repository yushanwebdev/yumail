import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail } from "lucide-react";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getDisplayName } from "@/lib/utils";
import { EmailAvatar } from "@/components/email-avatar";
import { EmailDetailActions } from "@/components/email-detail-actions";
import { EmailContentSkeleton } from "@/components/email-detail-skeleton";
import { FloatingComposeButton } from "@/components/floating-compose-button";
import { EmailContent } from "@/components/email-content";
import { EmailAttachments } from "@/components/email-attachments";

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const dayName = days[date.getUTCDay()];
  const month = months[date.getUTCMonth()];
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;

  return `${dayName}, ${month} ${day}, ${year}, ${hour12}:${minutes} ${ampm} UTC`;
}

export default async function ReceivedEmailDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const email = await fetchQuery(api.emails.getById, {
    id: id as Id<"emails">,
  });

  if (!email) {
    notFound();
  }

  // Mark as read if unread (non-blocking)
  if (!email.isRead) {
    fetchMutation(api.emails.markAsRead, { id: email._id });
  }

  const senderDisplayName = getDisplayName(email.from.name, email.from.email);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex items-center justify-between px-4 py-3 sm:px-12">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            YuMail
          </Link>
          <EmailDetailActions
            emailId={email._id}
            isRead={true}
            folder="inbox"
            backPath="/received"
            showBackButton
          />
        </div>
      </header>

      {/* Article Content */}
      <article className="mx-auto px-4 py-6 sm:px-12 sm:py-8">
        {/* Title */}
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          {email.subject}
        </h1>

        {/* Meta Info */}
        <div className="mt-6 flex items-center gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
          <div className="relative">
            <EmailAvatar
              email={email.from.email}
              name={email.from.name}
              className="h-12 w-12"
            />
            {/* Received indicator badge */}
            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-950">
              <Mail className="h-2.5 w-2.5 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-zinc-900 dark:text-zinc-50">
                {senderDisplayName}
              </p>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                Received
              </span>
            </div>
            <p className="text-sm text-zinc-500">
              {email.from.email} → {email.to.map((t) => t.email).join(", ")}
            </p>
          </div>
          <time className="text-sm text-zinc-500">
            {formatDate(email.timestamp)}
          </time>
        </div>

        {/* Email Body */}
        <div className="mt-8 overflow-x-auto">
          <Suspense fallback={<EmailContentSkeleton />}>
            <EmailContent resendId={email.resendId} folder="inbox" />
          </Suspense>
        </div>

        {/* Attachments */}
        {email.attachments && email.attachments.length > 0 && (
          <EmailAttachments
            attachments={email.attachments}
            resendId={email.resendId}
          />
        )}
      </article>

      <FloatingComposeButton />
    </div>
  );
}
