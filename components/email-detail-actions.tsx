"use client";

import { useRouter } from "next/navigation";
import {
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
}

export function EmailDetailActions({
  emailId,
  isRead,
  folder,
  backPath,
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

  return (
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
      {folder === "inbox" && (
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleToggleRead}
        >
          {isRead ? (
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
        onClick={handleDelete}
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </Button>
    </div>
  );
}
