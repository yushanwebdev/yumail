import { Suspense } from "react";
import { Inbox } from "lucide-react";
import { PageLayout } from "@/components/page-layout";
import { PageHeader } from "@/components/page-header";
import { FloatingComposeButton } from "@/components/floating-compose-button";
import { InboxSubtitleLoader, InboxBadgeLoader } from "@/components/inbox/inbox-header-loader";
import { InboxEmailListLoader } from "@/components/inbox/inbox-email-list-loader";
import { EmailListSkeleton } from "@/components/email-list-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReceivedPage() {
  return (
    <PageLayout>
      <PageHeader
        backHref="/"
        icon={Inbox}
        iconColor="emerald"
        title="Inbox"
        subtitle={
          <Suspense fallback={<Skeleton className="inline-block h-4 w-32" />}>
            <InboxSubtitleLoader />
          </Suspense>
        }
        badge={
          <Suspense fallback={null}>
            <InboxBadgeLoader />
          </Suspense>
        }
      />

      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        <Suspense fallback={<EmailListSkeleton />}>
          <InboxEmailListLoader />
        </Suspense>
      </div>

      <FloatingComposeButton />
    </PageLayout>
  );
}
