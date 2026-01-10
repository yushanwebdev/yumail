import { Inbox } from "lucide-react";
import { PageLayout } from "@/components/page-layout";
import { PageHeader } from "@/components/page-header";
import { FloatingComposeButton } from "@/components/floating-compose-button";
import { InboxSubtitle } from "@/components/inbox/inbox-subtitle";
import { InboxBadge } from "@/components/inbox/inbox-badge";
import { InboxEmailList } from "@/components/inbox/inbox-email-list";

export default function ReceivedPage() {
  return (
    <PageLayout>
      <PageHeader
        backHref="/"
        icon={Inbox}
        title="Inbox"
        subtitle={<InboxSubtitle />}
        badge={<InboxBadge />}
      />

      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        <InboxEmailList />
      </div>

      <FloatingComposeButton />
    </PageLayout>
  );
}
