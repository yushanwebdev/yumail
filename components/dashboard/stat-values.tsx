"use client";

import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function InboxCount({
  preloadedStats,
}: {
  preloadedStats: Preloaded<typeof api.emails.getStats>;
}) {
  const stats = usePreloadedQuery(preloadedStats);
  return <>{stats.totalInbox} emails</>;
}

export function SentCount({
  preloadedStats,
}: {
  preloadedStats: Preloaded<typeof api.emails.getStats>;
}) {
  const stats = usePreloadedQuery(preloadedStats);
  return <>{stats.totalSent} sent</>;
}

export function UnreadCount({
  preloadedStats,
}: {
  preloadedStats: Preloaded<typeof api.emails.getStats>;
}) {
  const stats = usePreloadedQuery(preloadedStats);
  return <>{stats.unreadCount} new</>;
}

export function TodayCount({
  preloadedStats,
}: {
  preloadedStats: Preloaded<typeof api.emails.getStats>;
}) {
  const stats = usePreloadedQuery(preloadedStats);
  return <>{stats.todayCount} received</>;
}
