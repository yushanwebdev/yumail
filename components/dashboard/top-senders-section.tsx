"use client";

import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { EmailAvatar } from "@/components/email-avatar";
import { getDisplayName } from "@/lib/utils";

export function TopSendersSection({
  preloadedSenders,
}: {
  preloadedSenders: Preloaded<typeof api.emails.getSenderBreakdown>;
}) {
  const senderBreakdown = usePreloadedQuery(preloadedSenders);

  if (senderBreakdown.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {senderBreakdown.map((sender) => (
        <div
          key={sender.email}
          className="flex flex-col items-center rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
        >
          <EmailAvatar
            email={sender.email}
            name={sender.name}
            className="mb-2 h-12 w-12"
          />
          <div className="w-full truncate text-center text-sm font-medium text-zinc-900 dark:text-zinc-50">
            {getDisplayName(sender.name, sender.email)}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {sender.count} {sender.count === 1 ? "email" : "emails"}
          </div>
        </div>
      ))}
    </div>
  );
}
