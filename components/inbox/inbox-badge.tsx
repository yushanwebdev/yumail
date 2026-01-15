"use client";

import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/badge";

export function InboxBadge({
  preloadedStats,
}: {
  preloadedStats: Preloaded<typeof api.emails.getStats>;
}) {
  const stats = usePreloadedQuery(preloadedStats);

  if (stats.unreadCount === 0) {
    return null;
  }

  return <Badge variant="emerald">{stats.unreadCount} new</Badge>;
}
