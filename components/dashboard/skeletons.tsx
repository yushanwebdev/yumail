import { Skeleton } from "@/components/ui/skeleton";

export function StatValueSkeleton() {
  return <Skeleton className="inline-block h-4 w-12" />;
}

export function RecentUnreadSkeleton() {
  return (
    <div className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex h-10 flex-col items-center justify-center">
            <Skeleton className="mb-1 h-3 w-6" />
            <Skeleton className="h-5 w-4" />
          </div>
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3.5 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TopSendersSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
        >
          <Skeleton className="mb-2 h-12 w-12 rounded-full" />
          <Skeleton className="mb-1 h-4 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  );
}
