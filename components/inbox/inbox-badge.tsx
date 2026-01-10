"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/badge";
import { AnimatePresence, motion } from "motion/react";

export function InboxBadge() {
  const stats = useQuery(api.emails.getStats);

  return (
    <AnimatePresence mode="wait">
      {stats !== undefined && stats.unreadCount > 0 && (
        <motion.div
          key="badge"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          <Badge variant="blue">{stats.unreadCount} new</Badge>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
