"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  MailOpen,
  Trash2,
  Circle,
  Reply,
  Forward,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatRelativeTime, getInitials, cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";

type ConvexEmail = Doc<"emails">;

interface EmailListProps {
  emails: ConvexEmail[];
  showSender?: boolean;
}

interface EmailContent {
  html: string | null;
  text: string | null;
  headers: Record<string, string> | null;
}

export function EmailList({ emails, showSender = true }: EmailListProps) {
  const markAsRead = useMutation(api.emails.markAsRead);
  const markAsUnread = useMutation(api.emails.markAsUnread);
  const deleteEmail = useMutation(api.emails.deleteEmail);

  const [selectedEmail, setSelectedEmail] = useState<ConvexEmail | null>(null);
  const [emailContent, setEmailContent] = useState<EmailContent | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);

  const handleEmailClick = async (email: ConvexEmail) => {
    setSelectedEmail(email);
    setEmailContent(null);

    // Mark as read if unread inbox email
    if (!email.isRead && email.folder === "inbox") {
      markAsRead({ id: email._id });
    }

    // Fetch full content from Resend API
    setLoadingContent(true);
    try {
      const res = await fetch(`/api/email/content/${email.resendId}?folder=${email.folder}`);
      if (res.ok) {
        const data = await res.json();
        setEmailContent(data);
      }
    } catch (err) {
      console.error("Failed to fetch email content:", err);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleClose = () => {
    setSelectedEmail(null);
    setEmailContent(null);
  };

  const handleDelete = (id: Id<"emails">) => {
    deleteEmail({ id });
    setSelectedEmail(null);
  };

  const handleToggleRead = (email: ConvexEmail) => {
    if (email.isRead) {
      markAsUnread({ id: email._id });
    } else {
      markAsRead({ id: email._id });
    }
  };

  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
          <Mail className="h-8 w-8 text-zinc-400" />
        </div>
        <p className="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-50">
          No emails yet
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          When you receive emails, they&apos;ll appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        <AnimatePresence initial={false}>
          {emails.map((email, index) => {
            const displayPerson = showSender ? email.from : email.to[0];
            return (
              <motion.div
                key={email._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.03 }}
                className={cn(
                  "group flex cursor-pointer items-start gap-4 px-4 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50",
                  !email.isRead &&
                    email.folder === "inbox" &&
                    "bg-blue-50/50 dark:bg-blue-950/20"
                )}
                onClick={() => handleEmailClick(email)}
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-zinc-100 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {getInitials(displayPerson.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {!email.isRead && email.folder === "inbox" && (
                      <Circle className="h-2 w-2 shrink-0 fill-blue-500 text-blue-500" />
                    )}
                    <span
                      className={cn(
                        "truncate",
                        !email.isRead && email.folder === "inbox"
                          ? "font-semibold text-zinc-900 dark:text-zinc-50"
                          : "font-medium text-zinc-700 dark:text-zinc-300"
                      )}
                    >
                      {displayPerson.name}
                    </span>
                    <span className="shrink-0 text-xs text-zinc-500">
                      {formatRelativeTime(new Date(email.timestamp))}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "truncate text-sm",
                      !email.isRead && email.folder === "inbox"
                        ? "font-medium text-zinc-900 dark:text-zinc-50"
                        : "text-zinc-700 dark:text-zinc-300"
                    )}
                  >
                    {email.subject}
                  </p>
                  <p className="truncate text-sm text-zinc-500">
                    Click to view email content
                  </p>
                </div>

                <div
                  className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  {email.folder === "inbox" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleToggleRead(email)}
                      title={email.isRead ? "Mark as unread" : "Mark as read"}
                    >
                      {email.isRead ? (
                        <Mail className="h-4 w-4" />
                      ) : (
                        <MailOpen className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/50"
                    onClick={() => handleDelete(email._id)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Email Detail Dialog */}
      <Dialog open={!!selectedEmail} onOpenChange={handleClose}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          {selectedEmail && (
            <>
              <DialogHeader>
                <DialogTitle className="pr-8 text-xl">
                  {selectedEmail.subject}
                </DialogTitle>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                {/* Sender/Recipient Info */}
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-zinc-100 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {getInitials(
                        showSender
                          ? selectedEmail.from.name
                          : selectedEmail.to[0].name
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-50">
                          {showSender
                            ? selectedEmail.from.name
                            : selectedEmail.to[0].name}
                        </p>
                        <p className="text-sm text-zinc-500">
                          {showSender
                            ? selectedEmail.from.email
                            : selectedEmail.to[0].email}
                        </p>
                      </div>
                      <span className="text-sm text-zinc-500">
                        {new Date(selectedEmail.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {showSender && (
                      <p className="mt-1 text-sm text-zinc-500">
                        To: {selectedEmail.to.map((t) => t.email).join(", ")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email Body */}
                <div className="rounded-lg border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
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
                      {loadingContent
                        ? "Loading..."
                        : "Email content not available"}
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
                  {selectedEmail.folder === "inbox" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleToggleRead(selectedEmail)}
                    >
                      {selectedEmail.isRead ? (
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
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/50"
                    onClick={() => handleDelete(selectedEmail._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
