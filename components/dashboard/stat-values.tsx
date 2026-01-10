"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, motion } from "motion/react";

function StatSkeleton() {
  return (
    <motion.span
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Skeleton className="inline-block h-4 w-12" />
    </motion.span>
  );
}

function StatValue({ children }: { children: React.ReactNode }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.span>
  );
}

export function InboxCount() {
  const stats = useQuery(api.emails.getStats);
  return (
    <AnimatePresence mode="wait">
      {stats === undefined ? (
        <StatSkeleton key="skeleton" />
      ) : (
        <StatValue key="value">{stats.totalInbox} emails</StatValue>
      )}
    </AnimatePresence>
  );
}

export function SentCount() {
  const stats = useQuery(api.emails.getStats);
  return (
    <AnimatePresence mode="wait">
      {stats === undefined ? (
        <StatSkeleton key="skeleton" />
      ) : (
        <StatValue key="value">{stats.totalSent} sent</StatValue>
      )}
    </AnimatePresence>
  );
}

export function UnreadCount() {
  const stats = useQuery(api.emails.getStats);
  return (
    <AnimatePresence mode="wait">
      {stats === undefined ? (
        <StatSkeleton key="skeleton" />
      ) : (
        <StatValue key="value">{stats.unreadCount} new</StatValue>
      )}
    </AnimatePresence>
  );
}

export function TodayCount() {
  const stats = useQuery(api.emails.getStats);
  return (
    <AnimatePresence mode="wait">
      {stats === undefined ? (
        <StatSkeleton key="skeleton" />
      ) : (
        <StatValue key="value">{stats.todayCount} received</StatValue>
      )}
    </AnimatePresence>
  );
}
