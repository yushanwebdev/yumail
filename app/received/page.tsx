import { Suspense } from "react";
import { Inbox } from "lucide-react";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { PageLayout } from "@/components/page-layout";
import { PageHeader } from "@/components/page-header";
import { FloatingComposeButton } from "@/components/floating-compose-button";
import { InboxSubtitle } from "@/components/inbox/inbox-subtitle";
import { InboxBadge } from "@/components/inbox/inbox-badge";
import { InboxEmailList } from "@/components/inbox/inbox-email-list";
import { EmailListSkeleton } from "@/components/email-list-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default async function ReceivedPage() {
  const [preloadedEmails, preloadedStats] = await Promise.all([
    preloadQuery(api.emails.listInbox),
    preloadQuery(api.emails.getStats),
  ]);

  return (
    <PageLayout>
      <PageHeader
        backHref="/"
        icon={Inbox}
        title="Inbox"
        subtitle={
          <Suspense fallback={<Skeleton className="inline-block h-4 w-32" />}>
            <InboxSubtitle preloadedStats={preloadedStats} />
          </Suspense>
        }
        badge={
          <Suspense fallback={null}>
            <InboxBadge preloadedStats={preloadedStats} />
          </Suspense>
        }
      />

      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        <Suspense fallback={<EmailListSkeleton />}>
          <InboxEmailList preloadedEmails={preloadedEmails} />
        </Suspense>
      </div>

      <FloatingComposeButton />
    </PageLayout>
  );
}
