"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { EmailList } from "@/components/email-list";
import { EmailListSkeleton } from "@/components/email-list-skeleton";
import { AnimatePresence, motion } from "motion/react";

export function SentEmailList() {
  const emails = useQuery(api.emails.listSent);

  return (
    <AnimatePresence mode="wait">
      {emails === undefined ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <EmailListSkeleton />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <EmailList emails={emails} showSender={false} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
