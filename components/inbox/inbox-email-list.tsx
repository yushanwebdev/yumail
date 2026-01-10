"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { EmailList } from "@/components/email-list";
import { EmailListSkeleton } from "@/components/email-list-skeleton";

export function InboxEmailList() {
  const emails = useQuery(api.emails.listInbox);

  if (emails === undefined) {
    return <EmailListSkeleton />;
  }

  return <EmailList emails={emails} showSender={true} />;
}
