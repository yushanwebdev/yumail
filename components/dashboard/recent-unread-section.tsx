"use client";

import Link from "next/link";
import { Mail, Check } from "lucide-react";
import { Preloaded, usePreloadedQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/empty-state";
import { getInitials, getDisplayName } from "@/lib/utils";

export function RecentUnreadSection({
  preloadedUnread,
}: {
  preloadedUnread: Preloaded<typeof api.emails.listUnread>;
}) {
  const unreadEmails = usePreloadedQuery(preloadedUnread);
  const markAsRead = useMutation(api.emails.markAsRead);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    return { month, day };
  };

  const displayEmails = unreadEmails.slice(0, 5);

  if (displayEmails.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
        <EmptyState icon={Mail} title="No unread emails" />
      </div>
    );
  }

  return (
    <div className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
      {displayEmails.map((email) => {
        const { month, day } = formatDate(email.timestamp);
        return (
          <Link key={email._id} href={`/received/${email._id}`}>
            <div className="group relative flex cursor-pointer items-center gap-4 p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900">
              <Avatar className="h-10 w-10 shrink-0 self-center">
                <AvatarFallback className="bg-zinc-900 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
                  {getInitials(getDisplayName(email.from.name, email.from.email))}
                </AvatarFallback>
              </Avatar>
              <div className="flex h-10 shrink-0 flex-col items-center justify-center text-center">
                <span className="text-xs font-medium leading-none text-emerald-600 dark:text-emerald-400">
                  {month}
                </span>
                <span className="text-lg font-semibold leading-tight text-zinc-900 dark:text-zinc-50">
                  {day}
                </span>
              </div>
              <div className="min-w-0 flex-1 self-center">
                <div className="font-medium leading-snug text-zinc-900 dark:text-zinc-50">
                  {getDisplayName(email.from.name, email.from.email)}
                </div>
                <div className="truncate text-sm leading-snug text-zinc-500 dark:text-zinc-400">
                  {email.subject}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-4 top-1/2 -translate-y-1/2 gap-1.5 bg-white opacity-0 shadow-sm transition-opacity hover:bg-emerald-50 hover:text-emerald-700 group-hover:opacity-100 dark:bg-zinc-900 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-400"
                onClick={(e) => {
                  e.preventDefault();
                  markAsRead({ id: email._id });
                }}
              >
                <Check className="h-3.5 w-3.5" />
                Mark read
              </Button>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
