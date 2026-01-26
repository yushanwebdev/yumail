"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePreloadedQuery, Preloaded } from "convex/react";
import { AlertTriangle, Send } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { getDisplayName } from "@/lib/utils";
import { EmailAvatar } from "@/components/email-avatar";
import { EmailDetailActions } from "@/components/email-detail-actions";
import { DeliveryStatusBadge } from "@/components/delivery-status-badge";
import { DeliveryTimeline } from "@/components/delivery-timeline";

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

interface SentEmailDetailClientProps {
  preloadedEmail: Preloaded<typeof api.emails.getById>;
  children: ReactNode;
}

export function SentEmailDetailClient({ preloadedEmail, children }: SentEmailDetailClientProps) {
  // This will use the preloaded data immediately and subscribe to real-time updates
  const email = usePreloadedQuery(preloadedEmail);

  if (!email) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">Email not found</p>
      </div>
    );
  }

  const senderDisplayName = getDisplayName(email.from.name, email.from.email);

  return (
    <>
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
          <div className="relative">
            <EmailAvatar
              email={email.from.email}
              name={email.from.name}
              className="h-12 w-12"
            />
            {/* Sent indicator badge */}
            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 ring-2 ring-white dark:ring-zinc-950">
              <Send className="h-2.5 w-2.5 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-zinc-900 dark:text-zinc-50">
                {senderDisplayName}
              </p>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                Sent
              </span>
            </div>
            <p className="text-sm text-zinc-500">
              {email.from.email} → {email.to.map((t) => t.email).join(", ")}
              {email.cc && email.cc.length > 0 && (
                <span> · Cc: {email.cc.map((c) => c.email).join(", ")}</span>
              )}
            </p>
          </div>
          <time className="text-sm text-zinc-500">
            {formatDate(email.timestamp)}
          </time>
        </div>

        {/* Delivery Status Section */}
        {email.deliveryStatus && (
          <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Delivery Status
              </h2>
              <DeliveryStatusBadge status={email.deliveryStatus} variant="badge" />
            </div>

            {/* Bounce Alert */}
            {email.deliveryStatus === "bounced" && email.bounceInfo && (
              <div className="mb-4 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/30">
                <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    {email.bounceInfo.type === "hard"
                      ? "Permanent delivery failure"
                      : "Temporary delivery failure"}
                  </p>
                  <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                    {email.bounceInfo.type === "hard"
                      ? "This email address appears to be invalid. Please verify the address and try again."
                      : "This was a temporary issue. The email may be delivered later, or you can try resending."}
                  </p>
                  {email.bounceInfo.message && (
                    <p className="mt-2 text-xs text-red-600 dark:text-red-500">
                      {email.bounceInfo.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Complained Alert */}
            {email.deliveryStatus === "complained" && (
              <div className="mb-4 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/30">
                <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    Marked as spam
                  </p>
                  <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                    The recipient marked this email as spam. Consider reviewing your email content and recipient list.
                  </p>
                </div>
              </div>
            )}

            {/* Timeline */}
            {email.statusHistory && email.statusHistory.length > 0 && (
              <DeliveryTimeline events={email.statusHistory} />
            )}
          </div>
        )}

        {/* Email Body */}
        <div className="mt-8 overflow-x-auto">
          {children}
        </div>
      </article>
    </>
  );
}
