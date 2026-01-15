import { Send } from "lucide-react";
import { PageLayout } from "@/components/page-layout";
import { PageHeader } from "@/components/page-header";
import { FloatingComposeButton } from "@/components/floating-compose-button";
import { SentSubtitle } from "@/components/sent/sent-subtitle";
import { SentEmailList } from "@/components/sent/sent-email-list";

export default function SentPage() {
  return (
    <PageLayout>
      <PageHeader
        backHref="/"
        icon={Send}
        iconColor="blue"
        title="Sent"
        subtitle={<SentSubtitle />}
      />

      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        <SentEmailList />
      </div>

      <FloatingComposeButton />
    </PageLayout>
  );
}
