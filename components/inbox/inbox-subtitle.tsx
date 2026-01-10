"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, motion } from "motion/react";

function SubtitleSkeleton() {
  return (
    <motion.span
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Skeleton className="inline-block h-4 w-32" />
    </motion.span>
  );
}

export function InboxSubtitle() {
  const stats = useQuery(api.emails.getStats);

  return (
    <AnimatePresence mode="wait">
      {stats === undefined ? (
        <SubtitleSkeleton key="skeleton" />
      ) : (
        <motion.span
          key="value"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {stats.totalInbox} emails · {stats.unreadCount} unread
        </motion.span>
      )}
    </AnimatePresence>
  );
}
