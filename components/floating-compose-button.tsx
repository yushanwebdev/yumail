import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FloatingComposeButton() {
  return (
    <div className="fixed bottom-6 right-6">
      <Link href="/compose">
        <Button className="h-12 gap-2 rounded-full bg-zinc-900 px-5 text-white shadow-lg hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
          Compose
        </Button>
      </Link>
    </div>
  );
}
