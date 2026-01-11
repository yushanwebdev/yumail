import { connection } from "next/server";
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import {
  InboxCount,
  SentCount,
  UnreadCount,
  TodayCount,
} from "./stat-values";
import { RecentUnreadSection } from "./recent-unread-section";
import { TopSendersSection } from "./top-senders-section";

export async function InboxCountLoader() {
  await connection();
  const preloadedStats = await preloadQuery(api.emails.getStats);
  return <InboxCount preloadedStats={preloadedStats} />;
}

export async function SentCountLoader() {
  await connection();
  const preloadedStats = await preloadQuery(api.emails.getStats);
  return <SentCount preloadedStats={preloadedStats} />;
}

export async function UnreadCountLoader() {
  await connection();
  const preloadedStats = await preloadQuery(api.emails.getStats);
  return <UnreadCount preloadedStats={preloadedStats} />;
}

export async function TodayCountLoader() {
  await connection();
  const preloadedStats = await preloadQuery(api.emails.getStats);
  return <TodayCount preloadedStats={preloadedStats} />;
}

export async function RecentUnreadLoader() {
  await connection();
  const preloadedUnread = await preloadQuery(api.emails.listUnread);
  return <RecentUnreadSection preloadedUnread={preloadedUnread} />;
}

export async function TopSendersLoader() {
  await connection();
  const preloadedSenders = await preloadQuery(api.emails.getSenderBreakdown, {
    limit: 4,
  });
  return <TopSendersSection preloadedSenders={preloadedSenders} />;
}
