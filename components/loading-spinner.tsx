import { Loader2 } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
      <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
    </div>
  );
}
