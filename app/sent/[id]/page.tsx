import { Suspense } from "react";
import { notFound } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { preloadQuery, fetchQuery } from "@/lib/convex-server";
import { SentEmailDetailClient } from "@/components/sent/sent-email-detail-client";
import { FloatingComposeButton } from "@/components/floating-compose-button";
import { EmailContent } from "@/components/email-content";
import { EmailContentSkeleton } from "@/components/email-detail-skeleton";

export default async function SentEmailDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Preload the query for the client component (real-time updates)
  const preloadedEmail = await preloadQuery(api.emails.getById, {
    id: id as Id<"emails">,
  });

  // Also fetch the data for server-side rendering
  const email = await fetchQuery(api.emails.getById, {
    id: id as Id<"emails">,
  });

  // Check if email exists
  if (!email) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Pass preloaded data to client component for real-time updates */}
      <SentEmailDetailClient preloadedEmail={preloadedEmail}>
        {/* EmailContent stays as a Server Component in Suspense */}
        <Suspense fallback={<EmailContentSkeleton />}>
          <EmailContent resendId={email.resendId} folder="sent" />
        </Suspense>
      </SentEmailDetailClient>

      <FloatingComposeButton />
    </div>
  );
}
