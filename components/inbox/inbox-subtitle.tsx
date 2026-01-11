"use client";

import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function InboxSubtitle({
  preloadedStats,
}: {
  preloadedStats: Preloaded<typeof api.emails.getStats>;
}) {
  const stats = usePreloadedQuery(preloadedStats);

  return <>{stats.totalInbox} emails · {stats.unreadCount} unread</>;
}
