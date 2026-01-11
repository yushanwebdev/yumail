import { Skeleton } from "@/components/ui/skeleton";

export function SentEmailDetailSkeleton() {
  return (
    <>
      {/* Header Info Skeleton */}
      <div className="mb-4">
        <Skeleton className="mb-2 h-7 w-3/4" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Content Skeleton */}
      <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
        {/* Recipient Info Skeleton */}
        <div className="mb-6 flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
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
    </>
  );
}
