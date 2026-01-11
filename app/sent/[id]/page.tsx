import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingComposeButton } from "@/components/floating-compose-button";
import { SentEmailDetailLoader } from "@/components/sent/sent-email-detail-loader";
import { SentEmailDetailSkeleton } from "@/components/sent/sent-email-detail-skeleton";

export default async function SentEmailDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* Static Back Button */}
        <Link href="/sent">
          <Button variant="ghost" size="sm" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>

        {/* Static Icon */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-100">
            <Send className="h-5 w-5 text-white dark:text-zinc-900" />
          </div>
        </div>

        {/* Dynamic Content */}
        <Suspense fallback={<SentEmailDetailSkeleton />}>
          <SentEmailDetailLoader id={id} />
        </Suspense>
      </div>

      <FloatingComposeButton />
    </div>
  );
}
