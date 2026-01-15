"use client";

import {
  Check,
  CheckCheck,
  Clock,
  AlertTriangle,
  XCircle,
  AlertOctagon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type DeliveryStatus =
  | "queued"
  | "sent"
  | "delivered"
  | "delayed"
  | "bounced"
  | "complained";

interface DeliveryStatusBadgeProps {
  status?: DeliveryStatus | null;
  variant?: "icon" | "badge";
  className?: string;
}

const statusConfig: Record<
  DeliveryStatus,
  {
    label: string;
    icon: typeof Check;
    badgeColors: string;
    iconColor: string;
  }
> = {
  queued: {
    label: "Queued",
    icon: Clock,
    badgeColors:
      "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    iconColor: "text-zinc-400",
  },
  sent: {
    label: "Sent",
    icon: Check,
    badgeColors:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
    iconColor: "text-blue-500",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCheck,
    badgeColors:
      "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400",
    iconColor: "text-green-500",
  },
  delayed: {
    label: "Delayed",
    icon: AlertTriangle,
    badgeColors:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
    iconColor: "text-amber-500",
  },
  bounced: {
    label: "Bounced",
    icon: XCircle,
    badgeColors:
      "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400",
    iconColor: "text-red-500",
  },
  complained: {
    label: "Spam",
    icon: AlertOctagon,
    badgeColors:
      "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400",
    iconColor: "text-red-500",
  },
};

export function DeliveryStatusBadge({
  status,
  variant = "badge",
  className,
}: DeliveryStatusBadgeProps) {
  // Don't render anything if no status
  if (!status) return null;

  const config = statusConfig[status];
  const Icon = config.icon;

  // Icon-only variant (for list view)
  if (variant === "icon") {
    return (
      <Icon
        className={cn("h-4 w-4 shrink-0", config.iconColor, className)}
        aria-label={config.label}
      />
    );
  }

  // Badge variant (icon + label in pill)
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.badgeColors,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}
