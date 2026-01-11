"use client";

import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { EmailList } from "@/components/email-list";

export function InboxEmailList({
  preloadedEmails,
}: {
  preloadedEmails: Preloaded<typeof api.emails.listInbox>;
}) {
  const emails = usePreloadedQuery(preloadedEmails);

  return <EmailList emails={emails} showSender={true} />;
}
