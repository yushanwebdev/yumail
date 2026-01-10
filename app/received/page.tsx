"use client";

import { Inbox } from "lucide-react";
import { EmailList } from "@/components/email-list";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageLayout } from "@/components/page-layout";
import { PageHeader } from "@/components/page-header";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Badge } from "@/components/badge";
import { FloatingComposeButton } from "@/components/floating-compose-button";

export default function ReceivedPage() {
  const emails = useQuery(api.emails.listInbox);
  const stats = useQuery(api.emails.getStats);

  if (emails === undefined || stats === undefined) {
    return <LoadingSpinner />;
  }

  return (
    <PageLayout>
      <PageHeader
        backHref="/"
        icon={Inbox}
        title="Inbox"
        subtitle={`${stats.totalInbox} emails · ${stats.unreadCount} unread`}
        badge={
          stats.unreadCount > 0 ? (
            <Badge variant="blue">{stats.unreadCount} new</Badge>
          ) : undefined
        }
      />

      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        <EmailList emails={emails} showSender={true} />
      </div>

      <FloatingComposeButton />
    </PageLayout>
  );
}
