"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, Inbox, PenSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmailList } from "@/components/email-list";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ReceivedPage() {
  const emails = useQuery(api.emails.listInbox);
  const stats = useQuery(api.emails.getStats);

  if (emails === undefined || stats === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900/30">
                <Inbox className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Received
                </h1>
                <p className="text-sm text-zinc-500">
                  {stats.totalInbox} emails · {stats.unreadCount} unread
                </p>
              </div>
            </div>

            {stats.unreadCount > 0 && (
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              >
                {stats.unreadCount} new
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Email List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden border-zinc-200 dark:border-zinc-800">
            <EmailList emails={emails} showSender={true} />
          </Card>
        </motion.div>
      </div>

      {/* Floating Compose Button */}
      <motion.div
        className="fixed bottom-6 right-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
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
