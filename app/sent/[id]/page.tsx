import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getInitials, getDisplayName } from "@/lib/utils";
import { EmailDetailActions } from "@/components/email-detail-actions";
import { EmailContentSkeleton } from "@/components/email-detail-skeleton";
import { FloatingComposeButton } from "@/components/floating-compose-button";
import { EmailContent } from "@/components/email-content";

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

export default async function SentEmailDetailPage({
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

  const recipientDisplayName = getDisplayName(email.to[0].name, email.to[0].email);

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
            folder="sent"
            backPath="/sent"
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
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-zinc-900 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
              {getInitials(recipientDisplayName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium text-zinc-900 dark:text-zinc-50">
              To: {recipientDisplayName}
            </p>
            <p className="text-sm text-zinc-500">
              {email.to.map((t) => t.email).join(", ")}
              {email.cc && email.cc.length > 0 && (
                <span> · Cc: {email.cc.map((c) => c.email).join(", ")}</span>
              )}
            </p>
          </div>
          <time className="text-sm text-zinc-500">
            {formatDate(email.timestamp)}
          </time>
        </div>

        {/* Email Body */}
        <div className="mt-8 overflow-x-auto">
          <Suspense fallback={<EmailContentSkeleton />}>
            <EmailContent resendId={email.resendId} folder="sent" />
          </Suspense>
        </div>
      </article>

      <FloatingComposeButton />
    </div>
  );
}
