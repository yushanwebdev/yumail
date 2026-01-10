"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, Send, PenSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmailList } from "@/components/email-list";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function SentPage() {
  const emails = useQuery(api.emails.listSent);
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

          <div className="flex items-center gap-3">
            <div className="rounded-full bg-violet-100 p-2 dark:bg-violet-900/30">
              <Send className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Sent
              </h1>
              <p className="text-sm text-zinc-500">
                {stats.totalSent} emails sent
              </p>
            </div>
          </div>
        </motion.div>

        {/* Email List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden border-zinc-200 dark:border-zinc-800">
            <EmailList emails={emails} showSender={false} />
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
