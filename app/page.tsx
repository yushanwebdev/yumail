"use client";

import Link from "next/link";
import {
  Mail,
  Inbox,
  Send,
  MailOpen,
  CalendarDays,
  ChevronRight,
  Search,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getInitials, getDisplayName } from "@/lib/utils";
import { LoadingSpinner } from "@/components/loading-spinner";
import { StatCard } from "@/components/stat-card";
import { SectionHeader } from "@/components/section-header";
import { EmptyState } from "@/components/empty-state";

export default function Dashboard() {
  const stats = useQuery(api.emails.getStats);
  const senderBreakdown = useQuery(api.emails.getSenderBreakdown, { limit: 4 });
  const unreadEmails = useQuery(api.emails.listUnread);
  const markAsRead = useMutation(api.emails.markAsRead);

  if (
    stats === undefined ||
    senderBreakdown === undefined ||
    unreadEmails === undefined
  ) {
    return <LoadingSpinner />;
  }

  const displayEmails = unreadEmails.slice(0, 5);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    return { month, day };
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            YuMail
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-600 dark:text-zinc-400"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-600 dark:text-zinc-400"
            >
              <Calendar className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="mb-10 text-center">
          <button className="mb-2 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300">
            Unread emails
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="mb-2 text-6xl font-bold text-zinc-900 dark:text-zinc-50">
            {stats.unreadCount}
          </div>
          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            {stats.unreadCount === 0
              ? "You're all caught up!"
              : `waiting in your inbox`}
          </p>
          <Link href="/compose">
            <Button className="rounded-full bg-zinc-900 px-6 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
              Compose email
            </Button>
          </Link>
        </div>

        {/* Quick Access Cards */}
        <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            href="/received"
            icon={Inbox}
            iconStyle="filled"
            title="Inbox"
            value={`${stats.totalInbox} emails`}
          />
          <StatCard
            href="/sent"
            icon={Send}
            iconStyle="outlined"
            title="Sent"
            value={`${stats.totalSent} sent`}
          />
          <StatCard
            icon={MailOpen}
            iconStyle="outlined"
            title="Unread"
            value={`${stats.unreadCount} new`}
          />
          <StatCard
            icon={CalendarDays}
            iconStyle="outlined"
            title="Today"
            value={`${stats.todayCount} received`}
          />
        </div>

        {/* Recent Unread Section */}
        <div className="mb-10">
          <SectionHeader title="Recent Unread" viewAllHref="/received" />

          {displayEmails.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
              <EmptyState icon={Mail} title="No unread emails" />
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
              {displayEmails.map((email) => {
                const { month, day } = formatDate(email.timestamp);
                return (
                  <Link key={email._id} href={`/received/${email._id}`}>
                    <div className="group flex cursor-pointer items-center gap-4 p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900">
                      <Avatar className="h-10 w-10 shrink-0 self-center">
                        <AvatarFallback className="bg-zinc-900 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
                          {getInitials(getDisplayName(email.from.name, email.from.email))}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex h-10 shrink-0 flex-col items-center justify-center text-center">
                        <span className="text-xs font-medium leading-none text-blue-600 dark:text-blue-400">
                          {month}
                        </span>
                        <span className="text-lg font-semibold leading-tight text-zinc-900 dark:text-zinc-50">
                          {day}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 self-center">
                        <div className="font-medium leading-snug text-zinc-900 dark:text-zinc-50">
                          {getDisplayName(email.from.name, email.from.email)}
                        </div>
                        <div className="truncate text-sm leading-snug text-zinc-500 dark:text-zinc-400">
                          {email.subject}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 self-center opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={(e) => {
                          e.preventDefault();
                          markAsRead({ id: email._id });
                        }}
                      >
                        Mark read
                      </Button>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Senders Section */}
        {senderBreakdown.length > 0 && (
          <div>
            <SectionHeader title="Top Senders" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {senderBreakdown.map((sender) => (
                <div
                  key={sender.email}
                  className="flex flex-col items-center rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
                >
                  <Avatar className="mb-2 h-12 w-12">
                    <AvatarFallback className="bg-zinc-100 text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {getInitials(getDisplayName(sender.name, sender.email))}
                    </AvatarFallback>
                  </Avatar>
                  <div className="w-full truncate text-center text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {getDisplayName(sender.name, sender.email)}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {sender.count} {sender.count === 1 ? "email" : "emails"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
