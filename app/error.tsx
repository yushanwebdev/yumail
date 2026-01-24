"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4 dark:bg-zinc-950">
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
          An unexpected error occurred. Try refreshing the page or contact
          support if the problem persists.
        </p>

        {error.digest && (
          <p className="mb-6 font-mono text-xs text-zinc-400 dark:text-zinc-500">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={reset}
            className="gap-2"
            aria-label="Try again to reload the page"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </Button>

          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
            aria-label="Go back to home page"
          >
            Go to home
          </Button>
        </div>
      </div>
    </div>
  );
}
