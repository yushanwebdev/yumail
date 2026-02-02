import { connection } from "next/server";
import { api } from "@/convex/_generated/api";
import { preloadQuery } from "@/lib/convex-server";
import { InboxSubtitle } from "./inbox-subtitle";
import { InboxBadge } from "./inbox-badge";

export async function InboxSubtitleLoader() {
  await connection();
  const preloadedStats = await preloadQuery(api.emails.getStats, {});
  return <InboxSubtitle preloadedStats={preloadedStats} />;
}

export async function InboxBadgeLoader() {
  await connection();
  const preloadedStats = await preloadQuery(api.emails.getStats, {});
  return <InboxBadge preloadedStats={preloadedStats} />;
}
