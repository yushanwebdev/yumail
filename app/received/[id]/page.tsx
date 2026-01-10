"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Mail,
  MailOpen,
  Trash2,
  Reply,
  Forward,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getInitials } from "@/lib/utils";

interface EmailContent {
  html: string | null;
  text: string | null;
  headers: Record<string, string> | null;
}

export default function ReceivedEmailDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const email = useQuery(api.emails.getById, { id: id as Id<"emails"> });
  const markAsRead = useMutation(api.emails.markAsRead);
  const markAsUnread = useMutation(api.emails.markAsUnread);
  const deleteEmail = useMutation(api.emails.deleteEmail);

  const [emailContent, setEmailContent] = useState<EmailContent | null>(null);
  const [fetchedResendId, setFetchedResendId] = useState<string | null>(null);

  const loadingContent = email?.resendId && fetchedResendId !== email.resendId;

  useEffect(() => {
    if (email && !email.isRead) {
      markAsRead({ id: email._id });
    }
  }, [email, markAsRead]);

  useEffect(() => {
    if (email?.resendId && fetchedResendId !== email.resendId) {
      const currentResendId = email.resendId;
      fetch(`/api/email/content/${currentResendId}?folder=${email.folder}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          setEmailContent(data);
          setFetchedResendId(currentResendId);
        })
        .catch(console.error);
    }
  }, [email?.resendId, email?.folder, fetchedResendId]);

  const handleToggleRead = () => {
    if (!email) return;
    if (email.isRead) {
      markAsUnread({ id: email._id });
    } else {
      markAsRead({ id: email._id });
    }
  };

  const handleDelete = async () => {
    if (!email) return;
    await deleteEmail({ id: email._id });
    router.push("/received");
  };

  if (email === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (email === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-zinc-500">Email not found</p>
        <Link href="/received">
          <Button variant="ghost" className="mt-4">
            Back to Received
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link href="/received">
            <Button variant="ghost" size="sm" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Received
            </Button>
          </Link>
        </motion.div>

        {/* Email Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden border-zinc-200 p-6 dark:border-zinc-800">
            {/* Subject */}
            <h1 className="mb-6 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {email.subject}
            </h1>

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
                  <span className="text-sm text-zinc-500">
                    {new Date(email.timestamp).toLocaleString()}
                  </span>
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
            <div className="mb-6 rounded-lg border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              {loadingContent ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                  <span className="ml-2 text-sm text-zinc-500">
                    Loading email content...
                  </span>
                </div>
              ) : emailContent?.html ? (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: emailContent.html }}
                />
              ) : emailContent?.text ? (
                <pre className="whitespace-pre-wrap font-sans text-sm text-zinc-700 dark:text-zinc-300">
                  {emailContent.text}
                </pre>
              ) : (
                <p className="text-sm text-zinc-500">
                  Email content not available
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <Button variant="outline" size="sm" className="gap-2">
                <Reply className="h-4 w-4" />
                Reply
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Forward className="h-4 w-4" />
                Forward
              </Button>
              <div className="flex-1" />
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleToggleRead}
              >
                {email.isRead ? (
                  <>
                    <Mail className="h-4 w-4" />
                    Mark unread
                  </>
                ) : (
                  <>
                    <MailOpen className="h-4 w-4" />
                    Mark read
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/50"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
