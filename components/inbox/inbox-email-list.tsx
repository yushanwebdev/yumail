"use client";

import { useState } from "react";
import { Preloaded, usePreloadedQuery, useQuery } from "convex/react";
import { ShieldAlert, Inbox, Filter } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { EmailList } from "@/components/email-list";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FilterType = undefined | "spam";

export function InboxEmailList({
  preloadedEmails,
}: {
  preloadedEmails: Preloaded<typeof api.emails.listInbox>;
}) {
  const [filter, setFilter] = useState<FilterType>(undefined);
  const defaultEmails = usePreloadedQuery(preloadedEmails);
  const stats = useQuery(api.emails.getStats);

  // Use client-side query when filter is active
  const filteredEmails = useQuery(
    api.emails.listInbox,
    filter ? { filter } : "skip"
  );

  const emails = filter ? filteredEmails : defaultEmails;
  const spamCount = stats?.spamCount ?? 0;

  return (
    <div data-view={filter === "spam" ? "spam" : "inbox"} data-spam-count={spamCount}>
      {/* Filter toggle */}
      <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
          <Filter className="h-4 w-4 text-zinc-400" />
          <span className="text-sm text-zinc-500">View:</span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 gap-1.5 text-xs",
                !filter && "bg-zinc-100 dark:bg-zinc-800"
              )}
              onClick={() => setFilter(undefined)}
            >
              <Inbox className="h-3.5 w-3.5" />
              Inbox
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 gap-1.5 text-xs",
                filter === "spam" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              )}
              onClick={() => setFilter("spam")}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              Spam
              {spamCount > 0 && (
                <span className="rounded-full bg-amber-200 px-1.5 text-[10px] font-medium text-amber-700 dark:bg-amber-800 dark:text-amber-300">
                  {spamCount}
                </span>
              )}
            </Button>
          </div>
        </div>

      {/* Email list */}
      {emails === undefined ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
        </div>
      ) : (
        <EmailList
          emails={emails}
          showSender={true}
          emptyMessage={
            filter === "spam"
              ? { title: "No spam", description: "Your spam folder is empty." }
              : undefined
          }
        />
      )}
    </div>
  );
}
