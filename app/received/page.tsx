"use client";

import Link from "next/link";
import { ArrowLeft, Inbox, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmailList } from "@/components/email-list";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ReceivedPage() {
  const emails = useQuery(api.emails.listInbox);
  const stats = useQuery(api.emails.getStats);

  if (emails === undefined || stats === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-100">
                <Inbox className="h-5 w-5 text-white dark:text-zinc-900" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  Inbox
                </h1>
                <p className="text-sm text-zinc-500">
                  {stats.totalInbox} emails · {stats.unreadCount} unread
                </p>
              </div>
            </div>

            {stats.unreadCount > 0 && (
              <div className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {stats.unreadCount} new
              </div>
            )}
          </div>
        </div>

        {/* Email List */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
          <EmailList emails={emails} showSender={true} />
        </div>
      </div>

      {/* Floating Compose Button */}
      <div className="fixed bottom-6 right-6">
        <Link href="/compose">
          <Button className="h-12 gap-2 rounded-full bg-pink-100 px-5 text-pink-900 shadow-lg hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-900/50">
            Compose
          </Button>
        </Link>
      </div>
    </div>
  );
}
