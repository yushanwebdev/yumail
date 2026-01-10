import { PageLayout } from "@/components/page-layout";

export function EmailListSkeleton() {
  return (
    <PageLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="mb-4 h-8 w-16 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div>
            <div className="mb-1 h-7 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      </div>

      {/* Email List */}
      <div className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex h-10 shrink-0 flex-col items-center justify-center gap-1">
              <div className="h-3 w-6 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-5 w-5 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 h-5 w-36 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-52 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
