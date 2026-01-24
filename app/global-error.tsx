"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-white dark:bg-zinc-950">
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="w-full max-w-md text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
                <AlertCircle
                  className="h-8 w-8 text-red-600 dark:text-red-400"
                  aria-hidden="true"
                />
              </div>
            </div>

            <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              Something went wrong
            </h1>

            <p className="mb-6 text-zinc-600 dark:text-zinc-400">
              A critical error occurred. Please try refreshing the page.
            </p>

            {error.digest && (
              <p className="mb-6 font-mono text-xs text-zinc-400 dark:text-zinc-500">
                Error ID: {error.digest}
              </p>
            )}

            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus-visible:ring-zinc-50"
              aria-label="Try again to reload the page"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
