"use client";

import Link from "next/link";
import { Mail, Check, Sparkles, ScanText } from "lucide-react";
import { toast } from "sonner";
import { Preloaded, usePreloadedQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { EmailAvatar } from "@/components/email-avatar";
import { EmptyState } from "@/components/empty-state";
import { getDisplayName } from "@/lib/utils";
import { detectVerificationCode } from "@/lib/verificationCodeDetector";

export function RecentUnreadSection({
  preloadedUnread,
}: {
  preloadedUnread: Preloaded<typeof api.emails.listUnread>;
}) {
  const unreadEmails = usePreloadedQuery(preloadedUnread);
  const markAsRead = useMutation(api.emails.markAsRead);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    return { month, day };
  };

  // Detect and copy verification code directly
  const handleDetectAndCopy = async (subject: string) => {
    const code = detectVerificationCode(subject);

    if (!code) {
      toast.error("No verification code found", {
        description: "No code detected in the email subject",
        duration: 2000,
      });
      return;
    }

    try {
      // Copy to clipboard
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = code;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      toast.success(`Code ${code} copied to clipboard`, {
        duration: 2000,
      });
    } catch (error) {
      console.error("Failed to copy code:", error);
      toast.error("Failed to copy code", {
        description: "Unable to copy to clipboard",
        duration: 3000,
      });
    }
  };

  if (unreadEmails.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
        <EmptyState icon={Mail} title="No unread emails" />
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 lg:min-h-0 lg:flex-1 dark:border-zinc-800">
      <div className="divide-y divide-zinc-100 lg:flex-1 lg:overflow-y-auto dark:divide-zinc-800">
        {unreadEmails.map((email) => {
          const { month, day } = formatDate(email.timestamp);
          return (
            <Link key={email._id} href={`/received/${email._id}`}>
              <div className="group relative flex cursor-pointer items-center gap-4 p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900">
                <EmailAvatar
                  email={email.from.email}
                  name={email.from.name}
                  className="h-10 w-10 shrink-0 self-center"
                />
                <div className="flex h-10 shrink-0 flex-col items-center justify-center text-center">
                  <span className="text-xs font-medium leading-none text-emerald-600 dark:text-emerald-400">
                    {month}
                  </span>
                  <span className="text-lg font-semibold leading-tight text-zinc-900 dark:text-zinc-50">
                    {day}
                  </span>
                </div>
                <div className="min-w-0 flex-1 self-center">
                  <div className="font-medium leading-snug text-zinc-900 dark:text-zinc-50">
                    {getDisplayName(email.from.name, email.from.email)}
                  </div>
                  <div className="truncate text-sm leading-snug text-zinc-500 dark:text-zinc-400">
                    {email.subject}
                  </div>
                </div>
                <div
                  className="absolute right-4 top-1/2 flex -translate-y-1/2 gap-1"
                  onClick={(e) => e.preventDefault()}
                >
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-8 w-8 bg-white shadow-sm hover:bg-blue-50 hover:text-blue-700 dark:bg-zinc-900 dark:hover:bg-blue-950/50 dark:hover:text-blue-400"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDetectAndCopy(email.subject);
                    }}
                    aria-label="Detect and copy verification code"
                    title="Detect and copy verification code"
                  >
                    <ScanText className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 bg-white shadow-sm hover:bg-emerald-50 hover:text-emerald-700 dark:bg-zinc-900 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-400"
                    onClick={(e) => {
                      e.preventDefault();
                      markAsRead({ id: email._id });
                    }}
                  >
                    <Check className="h-3.5 w-3.5" />
                    Mark read
                  </Button>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      {/* Show "All caught up" only when there are few items */}
      {unreadEmails.length < 5 && (
        <div className="flex flex-1 flex-col items-center justify-center border-t border-dashed border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/30">
          <Sparkles className="mb-2 h-5 w-5 text-zinc-300 dark:text-zinc-600" />
          <p className="text-sm text-zinc-400 dark:text-zinc-500">All caught up!</p>
        </div>
      )}
    </div>
  );
}
