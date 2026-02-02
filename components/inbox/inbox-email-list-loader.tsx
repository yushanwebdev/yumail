import { connection } from "next/server";
import { api } from "@/convex/_generated/api";
import { preloadQuery } from "@/lib/convex-server";
import { InboxEmailList } from "./inbox-email-list";

export async function InboxEmailListLoader() {
  await connection();
  const preloadedEmails = await preloadQuery(api.emails.listInbox, {});
  return <InboxEmailList preloadedEmails={preloadedEmails} />;
}
