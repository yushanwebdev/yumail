import { Skeleton } from "@/components/ui/skeleton";

export function EmailListSkeleton() {
  return (
    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-start gap-4 px-4 py-4">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="mt-1 h-4 w-48" />
            <Skeleton className="mt-1 h-3.5 w-36" />
          </div>
        </div>
      ))}
    </div>
  );
}
