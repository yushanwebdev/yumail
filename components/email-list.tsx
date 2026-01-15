"use client";

import Link from "next/link";
import {
  Mail,
  MailOpen,
  Trash2,
  Circle,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DeliveryStatusBadge } from "@/components/delivery-status-badge";
import { formatRelativeTime, getInitials, getDisplayName, cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";

type ConvexEmail = Doc<"emails">;

interface EmailListProps {
  emails: ConvexEmail[];
  showSender?: boolean;
}

export function EmailList({ emails, showSender = true }: EmailListProps) {
  const markAsRead = useMutation(api.emails.markAsRead);
  const markAsUnread = useMutation(api.emails.markAsUnread);
  const deleteEmail = useMutation(api.emails.deleteEmail);

  const handleDelete = (id: Id<"emails">) => {
    deleteEmail({ id });
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
    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {emails.map((email) => {
        const displayPerson = showSender ? email.from : email.to[0];
        const detailPath = email.folder === "inbox"
          ? `/received/${email._id}`
          : `/sent/${email._id}`;

        return (
          <Link key={email._id} href={detailPath}>
            <div
              className={cn(
                "group flex cursor-pointer items-start gap-4 px-4 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50",
                !email.isRead &&
                  email.folder === "inbox" &&
                  "bg-emerald-50/50 dark:bg-emerald-950/20"
              )}
            >
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarFallback className="bg-zinc-900 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
                  {getInitials(getDisplayName(displayPerson.name, displayPerson.email))}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {!email.isRead && email.folder === "inbox" && (
                    <Circle className="h-2 w-2 shrink-0 fill-emerald-500 text-emerald-500" />
                  )}
                  <span
                    className={cn(
                      "truncate",
                      !email.isRead && email.folder === "inbox"
                        ? "font-semibold text-zinc-900 dark:text-zinc-50"
                        : "font-medium text-zinc-700 dark:text-zinc-300"
                    )}
                  >
                    {getDisplayName(displayPerson.name, displayPerson.email)}
                  </span>
                  <span className="shrink-0 text-xs text-zinc-500">
                    {formatRelativeTime(new Date(email.timestamp))}
                  </span>
                  {email.folder === "sent" && (
                    <DeliveryStatusBadge
                      status={email.deliveryStatus}
                      variant="icon"
                    />
                  )}
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
                onClick={(e) => e.preventDefault()}
              >
                {email.folder === "inbox" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.preventDefault();
                      handleToggleRead(email);
                    }}
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
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(email._id);
                  }}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
