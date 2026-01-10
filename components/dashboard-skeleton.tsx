export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="h-8 w-24 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-9 w-9 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            <div className="ml-2 h-9 w-24 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>

        {/* Quick Access Cards */}
        <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div className="mb-3 h-10 w-10 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
              <div className="mb-1 h-5 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          ))}
        </div>

        {/* Recent Unread Section */}
        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-6 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-5 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <div className="flex h-10 shrink-0 flex-col items-center justify-center gap-1">
                  <div className="h-3 w-6 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-5 w-5 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 h-5 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-4 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Senders Section */}
        <div>
          <div className="mb-4 h-6 w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div className="mb-2 h-12 w-12 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <div className="mb-1 h-4 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-3 w-14 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
