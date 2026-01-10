import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Inbox } from "lucide-react";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { Resend } from "resend";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getInitials, getDisplayName } from "@/lib/utils";
import { EmailDetailActions } from "@/components/email-detail-actions";
import { EmailContentSkeleton } from "@/components/email-detail-skeleton";
import { PageLayout } from "@/components/page-layout";
import { PageHeader } from "@/components/page-header";
import { FloatingComposeButton } from "@/components/floating-compose-button";

const resend = new Resend(process.env.RESEND_API_KEY);

async function EmailContent({ resendId }: { resendId: string }) {
  const { data, error } = await resend.emails.receiving.get(resendId);

  if (error) {
    console.error("Resend fetch error:", error);
    return (
      <p className="text-sm text-zinc-500">Email content not available</p>
    );
  }

  const html = data?.html || null;
  const text = data?.text || null;

  if (html) {
    return (
      <div
        className="prose prose-sm dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  if (text) {
    return (
      <pre className="whitespace-pre-wrap font-sans text-sm text-zinc-700 dark:text-zinc-300">
        {text}
      </pre>
    );
  }

  return <p className="text-sm text-zinc-500">Email content not available</p>;
}

export default async function ReceivedEmailDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const email = await fetchQuery(api.emails.getById, {
    id: id as Id<"emails">,
  });

  if (!email) {
    notFound();
  }

  // Mark as read if unread (non-blocking)
  if (!email.isRead) {
    fetchMutation(api.emails.markAsRead, { id: email._id });
  }

  const senderDisplayName = getDisplayName(email.from.name, email.from.email);

  return (
    <PageLayout>
      <PageHeader
        backHref="/received"
        icon={Inbox}
        title={email.subject}
        titleSize="small"
        subtitle={new Date(email.timestamp).toLocaleString()}
      />

      <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
        {/* Sender Info */}
        <div className="mb-6 flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-zinc-100 text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              {getInitials(senderDisplayName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-50">
                  {senderDisplayName}
                </p>
                <p className="text-sm text-zinc-500">{email.from.email}</p>
              </div>
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              To: {email.to.map((t) => t.email).join(", ")}
            </p>
            {email.cc && email.cc.length > 0 && (
              <p className="text-sm text-zinc-500">
                Cc: {email.cc.map((c) => c.email).join(", ")}
              </p>
            )}
          </div>
        </div>

        {/* Email Body */}
        <div className="mb-6 rounded-lg border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <Suspense fallback={<EmailContentSkeleton />}>
            <EmailContent resendId={email.resendId} />
          </Suspense>
        </div>

        {/* Actions */}
        <EmailDetailActions
          emailId={email._id}
          isRead={true}
          folder="inbox"
          backPath="/received"
        />
      </div>

      <FloatingComposeButton />
    </PageLayout>
  );
}
