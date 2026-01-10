import Link from "next/link";
import {
  Inbox,
  Send,
  MailOpen,
  CalendarDays,
  Search,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/stat-card";
import { SectionHeader } from "@/components/section-header";
import {
  InboxCount,
  SentCount,
  UnreadCount,
  TodayCount,
} from "@/components/dashboard/stat-values";
import { RecentUnreadSection } from "@/components/dashboard/recent-unread-section";
import { TopSendersSection } from "@/components/dashboard/top-senders-section";

export default function Dashboard() {
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
            <Link href="/compose">
              <Button className="ml-2 h-9 rounded-full bg-zinc-900 px-4 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
                Compose
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Access Cards */}
        <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            href="/received"
            icon={Inbox}
            iconStyle="filled"
            title="Inbox"
            value={<InboxCount />}
          />
          <StatCard
            href="/sent"
            icon={Send}
            iconStyle="outlined"
            title="Sent"
            value={<SentCount />}
          />
          <StatCard
            icon={MailOpen}
            iconStyle="outlined"
            title="Unread"
            value={<UnreadCount />}
          />
          <StatCard
            icon={CalendarDays}
            iconStyle="outlined"
            title="Today"
            value={<TodayCount />}
          />
        </div>

        {/* Recent Unread Section */}
        <div className="mb-10">
          <SectionHeader title="Recent Unread" viewAllHref="/received" />
          <RecentUnreadSection />
        </div>

        {/* Top Senders Section */}
        <div>
          <SectionHeader title="Top Senders" />
          <TopSendersSection />
        </div>
      </div>
    </div>
  );
}
