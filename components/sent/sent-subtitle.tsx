"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";

export function SentSubtitle() {
  const stats = useQuery(api.emails.getStats);

  if (stats === undefined) {
    return <Skeleton className="inline-block h-4 w-24" />;
  }

  return <>{stats.totalSent} emails sent</>;
}
