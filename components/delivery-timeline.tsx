"use client";

import {
  Check,
  CheckCheck,
  Clock,
  AlertTriangle,
  XCircle,
  AlertOctagon,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  status: string;
  timestamp: number;
  details?: string;
}

interface DeliveryTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const eventConfig: Record<
  string,
  { icon: typeof Check; color: string; bgColor: string; label: string }
> = {
  queued: {
    icon: Clock,
    color: "text-zinc-400",
    bgColor: "bg-zinc-100 dark:bg-zinc-800",
    label: "Queued for delivery",
  },
  sent: {
    icon: Send,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/50",
    label: "Sent to mail server",
  },
  delivered: {
    icon: CheckCheck,
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950/50",
    label: "Delivered successfully",
  },
  delayed: {
    icon: AlertTriangle,
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/50",
    label: "Delivery delayed",
  },
  bounced: {
    icon: XCircle,
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-950/50",
    label: "Delivery failed",
  },
  complained: {
    icon: AlertOctagon,
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-950/50",
    label: "Marked as spam",
  },
};

function formatEventTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDeliveryDuration(
  events: TimelineEvent[]
): string | null {
  const queuedEvent = events.find((e) => e.status === "queued");
  const deliveredEvent = events.find((e) => e.status === "delivered");

  if (!queuedEvent || !deliveredEvent) return null;

  const durationMs = deliveredEvent.timestamp - queuedEvent.timestamp;
  const durationSecs = Math.floor(durationMs / 1000);
  const durationMins = Math.floor(durationSecs / 60);

  if (durationSecs < 60) {
    return "Delivered instantly";
  } else if (durationMins < 60) {
    return `Delivered in ${durationMins} minute${durationMins !== 1 ? "s" : ""}`;
  } else {
    const hours = Math.floor(durationMins / 60);
    return `Delivered in ${hours} hour${hours !== 1 ? "s" : ""}`;
  }
}

export function DeliveryTimeline({ events, className }: DeliveryTimelineProps) {
  if (!events || events.length === 0) return null;

  // Sort events by timestamp (newest first for display)
  const sortedEvents = [...events].sort((a, b) => b.timestamp - a.timestamp);
  const deliveryDuration = formatDeliveryDuration(events);

  return (
    <div className={cn("", className)}>
      {/* Delivery duration badge */}
      {deliveryDuration && (
        <p className="mb-4 text-sm text-green-600 dark:text-green-400 font-medium">
          {deliveryDuration}
        </p>
      )}

      {/* Timeline events */}
      <div className="space-y-0">
        {sortedEvents.map((event, index) => {
          const config = eventConfig[event.status] || eventConfig.queued;
          const Icon = config.icon;
          const isLatest = index === 0;
          const isLast = index === sortedEvents.length - 1;
          const isTerminal =
            event.status === "delivered" ||
            event.status === "bounced" ||
            event.status === "complained";

          return (
            <div
              key={`${event.status}-${event.timestamp}`}
              className="relative flex gap-4"
            >
              {/* Icon column with connecting line */}
              <div className="flex flex-col items-center">
                {/* Icon dot */}
                <div
                  className={cn(
                    "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                    config.bgColor,
                    isLatest &&
                      isTerminal &&
                      "ring-2 ring-offset-2 ring-offset-zinc-50 dark:ring-offset-zinc-900",
                    isLatest && event.status === "delivered" && "ring-green-500",
                    isLatest && event.status === "bounced" && "ring-red-500",
                    isLatest && event.status === "complained" && "ring-red-500"
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", config.color)} />
                </div>
                {/* Connecting line to next item */}
                {!isLast && (
                  <div className="w-0.5 flex-1 min-h-4 bg-zinc-200 dark:bg-zinc-700" />
                )}
              </div>

              {/* Content */}
              <div className={cn("flex-1", !isLast && "pb-4")}>
                <p
                  className={cn(
                    "text-sm font-medium",
                    isLatest
                      ? "text-zinc-900 dark:text-zinc-50"
                      : "text-zinc-600 dark:text-zinc-400"
                  )}
                >
                  {config.label}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  {formatEventTime(event.timestamp)}
                </p>
                {event.details && (
                  <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500 truncate max-w-xs">
                    {event.details}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
