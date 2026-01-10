"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { EmailList } from "@/components/email-list";
import { EmailListSkeleton } from "@/components/email-list-skeleton";

export function SentEmailList() {
  const emails = useQuery(api.emails.listSent);

  if (emails === undefined) {
    return <EmailListSkeleton />;
  }

  return <EmailList emails={emails} showSender={false} />;
}
