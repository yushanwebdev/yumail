import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Inbox } from "lucide-react";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { Resend } from "resend";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getInitials } from "@/lib/utils";
import { EmailDetailActions } from "@/components/email-detail-actions";
import { EmailContentSkeleton } from "@/components/email-detail-skeleton";

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

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link href="/received">
            <Button variant="ghost" size="sm" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-100">
              <Inbox className="h-5 w-5 text-white dark:text-zinc-900" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                {email.subject}
              </h1>
              <p className="text-sm text-zinc-500">
                {new Date(email.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Email Content */}
        <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
          {/* Sender Info */}
          <div className="mb-6 flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-zinc-100 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {getInitials(email.from.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    {email.from.name}
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
      </div>

      {/* Floating Compose Button */}
      <div className="fixed bottom-6 right-6">
        <Link href="/compose">
          <Button className="h-12 gap-2 rounded-full bg-pink-100 px-5 text-pink-900 shadow-lg hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-900/50">
            Compose
          </Button>
        </Link>
      </div>
    </div>
  );
}
