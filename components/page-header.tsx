import Link from "next/link";
import { ArrowLeft, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface PageHeaderProps {
  backHref: string;
  backLabel?: string;
  icon?: LucideIcon;
  iconColor?: "default" | "emerald" | "blue";
  title: string;
  titleSize?: "default" | "small";
  subtitle?: ReactNode;
  badge?: ReactNode;
}

export function PageHeader({
  backHref,
  backLabel = "Back",
  icon: Icon,
  iconColor = "default",
  title,
  titleSize = "default",
  subtitle,
  badge,
}: PageHeaderProps) {
  const iconColorStyles = {
    default: "bg-zinc-900 dark:bg-zinc-100",
    emerald: "bg-emerald-500 dark:bg-emerald-500",
    blue: "bg-blue-500 dark:bg-blue-500",
  };

  return (
    <div className="mb-6">
      <Link href={backHref}>
        <Button variant="ghost" size="sm" className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Button>
      </Link>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${iconColorStyles[iconColor]}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
          )}
          <div>
            <h1
              className={`font-bold text-zinc-900 dark:text-zinc-50 ${
                titleSize === "small" ? "text-xl" : "text-2xl"
              }`}
            >
              {title}
            </h1>
            {subtitle && <div className="text-sm text-zinc-500">{subtitle}</div>}
          </div>
        </div>

        {badge}
      </div>
    </div>
  );
}
