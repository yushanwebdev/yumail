"use client";

import { Send } from "lucide-react";
import { EmailList } from "@/components/email-list";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageLayout } from "@/components/page-layout";
import { PageHeader } from "@/components/page-header";
import { EmailListSkeleton } from "@/components/email-list-skeleton";
import { FloatingComposeButton } from "@/components/floating-compose-button";

export default function SentPage() {
  const emails = useQuery(api.emails.listSent);
  const stats = useQuery(api.emails.getStats);

  if (emails === undefined || stats === undefined) {
    return <EmailListSkeleton />;
  }

  return (
    <PageLayout>
      <PageHeader
        backHref="/"
        icon={Send}
        title="Sent"
        subtitle={`${stats.totalSent} emails sent`}
      />

      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        <EmailList emails={emails} showSender={false} />
      </div>

      <FloatingComposeButton />
    </PageLayout>
  );
}
