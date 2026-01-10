import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface EmailDetailSkeletonProps {
  backLabel: string;
  backPath: string;
}

export function EmailDetailSkeleton({
  backLabel,
  backPath,
}: EmailDetailSkeletonProps) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" className="mb-4 gap-2" asChild>
            <a href={backPath}>
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </a>
          </Button>
        </div>

        {/* Email Content Skeleton */}
        <Card className="overflow-hidden border-zinc-200 p-6 dark:border-zinc-800">
          {/* Subject Skeleton */}
          <Skeleton className="mb-6 h-8 w-3/4" />

          {/* Sender Info Skeleton */}
          <div className="mb-6 flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-4 w-36" />
              </div>
              <Skeleton className="mt-2 h-4 w-56" />
            </div>
          </div>

          {/* Email Body Skeleton */}
          <div className="mb-6 rounded-lg border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
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
        </Card>
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
