"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";

export function InboxSubtitle() {
  const stats = useQuery(api.emails.getStats);

  if (stats === undefined) {
    return <Skeleton className="inline-block h-4 w-32" />;
  }

  return <>{stats.totalInbox} emails · {stats.unreadCount} unread</>;
}
