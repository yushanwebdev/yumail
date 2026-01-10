import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { fetchQuery } from "convex/nextjs";
import { Resend } from "resend";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getInitials } from "@/lib/utils";
import { EmailDetailActions } from "@/components/email-detail-actions";
import { EmailContentSkeleton } from "@/components/email-detail-skeleton";

const resend = new Resend(process.env.RESEND_API_KEY);

async function EmailContent({ resendId }: { resendId: string }) {
  const { data, error } = await resend.emails.get(resendId);

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

export default async function SentEmailDetailPage({
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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header - renders immediately */}
        <div className="mb-6">
          <Link href="/sent">
            <Button variant="ghost" size="sm" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Sent
            </Button>
          </Link>
        </div>

        {/* Email Content */}
        <Card className="overflow-hidden border-zinc-200 p-6 dark:border-zinc-800">
          {/* Subject - renders immediately */}
          <h1 className="mb-6 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {email.subject}
          </h1>

          {/* Recipient Info - renders immediately */}
          <div className="mb-6 flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-zinc-100 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {getInitials(email.to[0].name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    To: {email.to[0].name}
                  </p>
                  <p className="text-sm text-zinc-500">{email.to[0].email}</p>
                </div>
                <span className="text-sm text-zinc-500">
                  {new Date(email.timestamp).toLocaleString()}
                </span>
              </div>
              {email.to.length > 1 && (
                <p className="mt-1 text-sm text-zinc-500">
                  +{email.to.length - 1} more recipient
                  {email.to.length > 2 ? "s" : ""}:{" "}
                  {email.to
                    .slice(1)
                    .map((t) => t.email)
                    .join(", ")}
                </p>
              )}
              {email.cc && email.cc.length > 0 && (
                <p className="text-sm text-zinc-500">
                  Cc: {email.cc.map((c) => c.email).join(", ")}
                </p>
              )}
            </div>
          </div>

          {/* Email Body - streams in progressively */}
          <div className="mb-6 rounded-lg border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <Suspense fallback={<EmailContentSkeleton />}>
              <EmailContent resendId={email.resendId} />
            </Suspense>
          </div>

          {/* Actions - renders immediately */}
          <EmailDetailActions
            emailId={email._id}
            isRead={email.isRead}
            folder="sent"
            backPath="/sent"
          />
        </Card>
      </div>
    </div>
  );
}
