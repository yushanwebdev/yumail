"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/badge";

export function InboxBadge() {
  const stats = useQuery(api.emails.getStats);

  if (stats === undefined || stats.unreadCount === 0) {
    return null;
  }

  return <Badge variant="blue">{stats.unreadCount} new</Badge>;
}
