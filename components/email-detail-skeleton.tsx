import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface EmailDetailSkeletonProps {
  backLabel?: string;
  backPath: string;
}

export function EmailDetailSkeleton({
  backPath,
}: EmailDetailSkeletonProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex items-center justify-between px-4 py-3 sm:px-12">
          <a
            href="/"
            className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            YuMail
          </a>
          {/* Actions Skeleton */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Skeleton className="h-8 w-8 sm:w-28" />
            <Skeleton className="h-8 w-8 sm:w-20" />
            <Skeleton className="h-8 w-8 sm:w-24" />
            <Skeleton className="h-8 w-8 sm:w-28" />
            <Skeleton className="h-8 w-8 sm:w-20" />
          </div>
        </div>
      </header>

      {/* Article Content */}
      <article className="mx-auto px-4 py-6 sm:px-12 sm:py-8">
        {/* Title Skeleton */}
        <Skeleton className="h-8 w-3/4 sm:h-9" />

        {/* Meta Info Skeleton */}
        <div className="mt-6 flex items-center gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-40 sm:w-56" />
          </div>
          <Skeleton className="hidden h-4 w-48 sm:block" />
        </div>

        {/* Email Body Skeleton */}
        <div className="mt-8">
          <EmailContentSkeleton />
        </div>
      </article>

      {/* Floating Compose Button */}
      <Link
        href="/compose"
        className="fixed bottom-6 right-6 flex h-12 items-center gap-2 rounded-full bg-zinc-900 px-5 text-white shadow-lg hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Compose
      </Link>
    </div>
  );
}

export function EmailContentSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header bar skeleton */}
      <Skeleton className="h-8 w-full" />

      {/* Content block skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/5" />
      </div>

      {/* Table skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>

      {/* Footer text skeleton */}
      <div className="space-y-2 pt-4">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
