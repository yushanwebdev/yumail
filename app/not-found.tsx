import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4 dark:bg-zinc-950">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
            <FileQuestion
              className="h-8 w-8 text-zinc-600 dark:text-zinc-400"
              aria-hidden="true"
            />
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Page not found
        </h1>

        <p className="mb-6 text-zinc-600 dark:text-zinc-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Button asChild>
          <Link href="/" aria-label="Return to home page">
            Go to home
          </Link>
        </Button>
      </div>
    </div>
  );
}
