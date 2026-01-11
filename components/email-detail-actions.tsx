"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  MailOpen,
  Trash2,
  Reply,
  Forward,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface EmailDetailActionsProps {
  emailId: Id<"emails">;
  isRead: boolean;
  folder: "inbox" | "sent";
  backPath: string;
  showBackButton?: boolean;
}

export function EmailDetailActions({
  emailId,
  isRead,
  folder,
  backPath,
  showBackButton = false,
}: EmailDetailActionsProps) {
  const router = useRouter();
  const markAsRead = useMutation(api.emails.markAsRead);
  const markAsUnread = useMutation(api.emails.markAsUnread);
  const deleteEmail = useMutation(api.emails.deleteEmail);

  const handleToggleRead = async () => {
    if (isRead) {
      await markAsUnread({ id: emailId });
    } else {
      await markAsRead({ id: emailId });
    }
    router.refresh();
  };

  const handleDelete = async () => {
    await deleteEmail({ id: emailId });
    router.push(backPath);
  };

  const backLabel = folder === "inbox" ? "Back to Inbox" : "Back to Sent";

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {showBackButton && (
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => router.push(backPath)}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{backLabel}</span>
        </Button>
      )}
      <Button variant="ghost" size="sm" className="gap-2">
        <Reply className="h-4 w-4" />
        <span className="hidden sm:inline">Reply</span>
      </Button>
      <Button variant="ghost" size="sm" className="gap-2">
        <Forward className="h-4 w-4" />
        <span className="hidden sm:inline">Forward</span>
      </Button>
      {folder === "inbox" && (
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={handleToggleRead}
        >
          {isRead ? (
            <>
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Mark unread</span>
            </>
          ) : (
            <>
              <MailOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Mark read</span>
            </>
          )}
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/50"
        onClick={handleDelete}
      >
        <Trash2 className="h-4 w-4" />
        <span className="hidden sm:inline">Delete</span>
      </Button>
    </div>
  );
}
