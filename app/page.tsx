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
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getInitials } from "@/lib/utils";

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
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
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
            <Button className="rounded-full bg-pink-100 px-6 text-pink-900 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-900/50">
              Compose email
            </Button>
          </Link>
        </div>

        {/* Quick Access Cards */}
        <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Link href="/received" className="block">
            <div className="rounded-xl border border-zinc-200 p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-900">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-100">
                <Inbox className="h-5 w-5 text-white dark:text-zinc-900" />
              </div>
              <div className="font-medium text-zinc-900 dark:text-zinc-50">
                Inbox
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                {stats.totalInbox} emails
              </div>
            </div>
          </Link>

          <Link href="/sent" className="block">
            <div className="rounded-xl border border-zinc-200 p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-900">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700">
                <Send className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
              </div>
              <div className="font-medium text-zinc-900 dark:text-zinc-50">
                Sent
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                {stats.totalSent} sent
              </div>
            </div>
          </Link>

          <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700">
              <MailOpen className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div className="font-medium text-zinc-900 dark:text-zinc-50">
              Unread
            </div>
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              {stats.unreadCount} new
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700">
              <CalendarDays className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div className="font-medium text-zinc-900 dark:text-zinc-50">
              Today
            </div>
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              {stats.todayCount} received
            </div>
          </div>
        </div>

        {/* Recent Unread Section */}
        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Recent Unread
            </h2>
            <Link
              href="/received"
              className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            >
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {displayEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 py-12 dark:border-zinc-800">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <Mail className="h-6 w-6 text-zinc-400" />
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No unread emails
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
              {displayEmails.map((email) => {
                const { month, day } = formatDate(email.timestamp);
                return (
                  <div
                    key={email._id}
                    className="group flex items-center gap-4 p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-zinc-900 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
                        {getInitials(email.from.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex shrink-0 flex-col items-center text-center">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        {month}
                      </span>
                      <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                        {day}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-zinc-900 dark:text-zinc-50">
                        {email.from.name}
                      </div>
                      <div className="truncate text-sm text-zinc-500 dark:text-zinc-400">
                        {email.subject}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead({ id: email._id });
                      }}
                    >
                      Mark read
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Senders Section */}
        {senderBreakdown.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Top Senders
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {senderBreakdown.map((sender) => (
                <div
                  key={sender.email}
                  className="flex flex-col items-center rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
                >
                  <Avatar className="mb-2 h-12 w-12">
                    <AvatarFallback className="bg-zinc-100 text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {getInitials(sender.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="w-full truncate text-center text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {sender.name}
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
