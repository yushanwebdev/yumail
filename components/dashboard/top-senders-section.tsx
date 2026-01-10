"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials, getDisplayName } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";

function TopSendersSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="grid grid-cols-2 gap-3 md:grid-cols-4"
    >
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
        >
          <Skeleton className="mb-2 h-12 w-12 rounded-full" />
          <Skeleton className="mb-1 h-4 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </motion.div>
  );
}

export function TopSendersSection() {
  const senderBreakdown = useQuery(api.emails.getSenderBreakdown, { limit: 4 });

  return (
    <AnimatePresence mode="wait">
      {senderBreakdown === undefined ? (
        <TopSendersSkeleton key="skeleton" />
      ) : senderBreakdown.length === 0 ? null : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-2 gap-3 md:grid-cols-4"
        >
          {senderBreakdown.map((sender) => (
            <div
              key={sender.email}
              className="flex flex-col items-center rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <Avatar className="mb-2 h-12 w-12">
                <AvatarFallback className="bg-zinc-100 text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {getInitials(getDisplayName(sender.name, sender.email))}
                </AvatarFallback>
              </Avatar>
              <div className="w-full truncate text-center text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {getDisplayName(sender.name, sender.email)}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {sender.count} {sender.count === 1 ? "email" : "emails"}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
