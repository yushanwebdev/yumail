"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  Mail,
  Inbox,
  Send,
  Clock,
  Users,
  PenSquare,
  ChevronRight,
  Circle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatRelativeTime, getInitials } from "@/lib/utils";

export default function Dashboard() {
  const stats = useQuery(api.emails.getStats);
  const senderBreakdown = useQuery(api.emails.getSenderBreakdown, { limit: 5 });
  const unreadEmails = useQuery(api.emails.listUnread);
  const markAsRead = useMutation(api.emails.markAsRead);

  // Show loading state
  if (stats === undefined || senderBreakdown === undefined || unreadEmails === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  const displayEmails = unreadEmails.slice(0, 5);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Welcome back! Here&apos;s your inbox overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Unread
                </CardTitle>
                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  {stats.unreadCount}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  emails need attention
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Inbox
                </CardTitle>
                <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900/30">
                  <Inbox className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  {stats.totalInbox}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  total received emails
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Sent
                </CardTitle>
                <div className="rounded-full bg-violet-100 p-2 dark:bg-violet-900/30">
                  <Send className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  {stats.totalSent}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  emails you&apos;ve sent
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Today
                </CardTitle>
                <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900/30">
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  {stats.todayCount}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  emails today
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Access - Unread Emails */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Circle className="h-3 w-3 fill-blue-500 text-blue-500" />
                  Unread Emails
                </CardTitle>
                <Link href="/received">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View all
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {displayEmails.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="rounded-full bg-zinc-100 p-3 dark:bg-zinc-800">
                      <Mail className="h-6 w-6 text-zinc-400" />
                    </div>
                    <p className="mt-3 text-sm text-zinc-500">
                      You&apos;re all caught up!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayEmails.map((email) => (
                      <motion.div
                        key={email._id}
                        className="group flex items-start gap-3 rounded-lg border border-zinc-100 bg-white p-3 transition-colors hover:border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50"
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarFallback className="bg-zinc-100 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                            {getInitials(email.from.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                              {email.from.name}
                            </p>
                            <span className="shrink-0 text-xs text-zinc-500">
                              {formatRelativeTime(new Date(email.timestamp))}
                            </span>
                          </div>
                          <p className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            {email.subject}
                          </p>
                          <p className="truncate text-sm text-zinc-500">
                            Click to view full email content
                          </p>
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
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Sender Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-4 w-4" />
                    Top Senders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {senderBreakdown.length === 0 ? (
                    <p className="text-sm text-zinc-500">No emails yet</p>
                  ) : (
                    <div className="space-y-3">
                      {senderBreakdown.map((item) => (
                        <div
                          key={item.email}
                          className="flex items-center gap-3"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-zinc-100 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                              {getInitials(item.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                              {item.name}
                            </p>
                            <p className="truncate text-xs text-zinc-500">
                              {item.email}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className="shrink-0 bg-zinc-100 dark:bg-zinc-800"
                          >
                            {item.count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Navigation Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link href="/received">
                <Card className="group cursor-pointer border-zinc-200 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900/30">
                      <Inbox className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-zinc-900 dark:text-zinc-50">
                        Received
                      </p>
                      <p className="text-sm text-zinc-500">
                        View all inbox emails
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-zinc-400 transition-transform group-hover:translate-x-1" />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Link href="/sent">
                <Card className="group cursor-pointer border-zinc-200 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="rounded-full bg-violet-100 p-2 dark:bg-violet-900/30">
                      <Send className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-zinc-900 dark:text-zinc-50">
                        Sent
                      </p>
                      <p className="text-sm text-zinc-500">
                        View sent emails
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-zinc-400 transition-transform group-hover:translate-x-1" />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating Compose Button */}
      <motion.div
        className="fixed bottom-6 right-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
      >
        <Link href="/compose">
          <Button
            size="lg"
            className="h-14 gap-2 rounded-full bg-zinc-900 px-6 text-white shadow-lg hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <PenSquare className="h-5 w-5" />
            Compose
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
