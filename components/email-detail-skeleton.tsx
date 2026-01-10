import Link from "next/link";
import { ArrowLeft, Inbox, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface EmailDetailSkeletonProps {
  backLabel?: string;
  backPath: string;
  folder?: "inbox" | "sent";
}

export function EmailDetailSkeleton({
  backLabel = "Back",
  backPath,
  folder = "inbox",
}: EmailDetailSkeletonProps) {
  const Icon = folder === "inbox" ? Inbox : Send;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link href={backPath}>
            <Button variant="ghost" size="sm" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-100">
              <Icon className="h-5 w-5 text-white dark:text-zinc-900" />
            </div>
            <div className="flex-1">
              <Skeleton className="mb-2 h-6 w-3/4" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>

        {/* Email Content Skeleton */}
        <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
          {/* Sender Info Skeleton */}
          <div className="mb-6 flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              <Skeleton className="mt-2 h-4 w-56" />
            </div>
          </div>

          {/* Email Body Skeleton */}
          <div className="mb-6 rounded-lg border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          {/* Actions Skeleton */}
          <div className="flex items-center gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
            <div className="flex-1" />
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      </div>

      {/* Floating Compose Button */}
      <div className="fixed bottom-6 right-6">
        <Link href="/compose">
          <Button className="h-12 gap-2 rounded-full bg-zinc-900 px-5 text-white shadow-lg hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
            Compose
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function EmailContentSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}
