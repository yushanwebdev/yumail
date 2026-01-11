import { connection } from "next/server";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { InboxEmailList } from "./inbox-email-list";

export async function InboxEmailListLoader() {
  await connection();
  const preloadedEmails = await preloadQuery(api.emails.listInbox);
  return <InboxEmailList preloadedEmails={preloadedEmails} />;
}
