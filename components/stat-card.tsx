import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  href?: string;
  icon: LucideIcon;
  iconStyle?: "filled" | "outlined";
  title: string;
  value: string;
}

export function StatCard({
  href,
  icon: Icon,
  iconStyle = "outlined",
  title,
  value,
}: StatCardProps) {
  const content = (
    <div
      className={`rounded-xl border border-zinc-200 p-4 dark:border-zinc-800 ${
        href
          ? "transition-[background-color,border-color] duration-300 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:border-zinc-900 group-hover:bg-zinc-900 dark:group-hover:border-zinc-100 dark:group-hover:bg-zinc-100"
          : ""
      }`}
    >
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center ${
          iconStyle === "filled"
            ? `rounded-full bg-zinc-900 dark:bg-zinc-100 ${
                href
                  ? "transition-[background-color,border-color] duration-300 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:bg-white dark:group-hover:bg-zinc-900"
                  : ""
              }`
            : `rounded-lg border border-zinc-200 dark:border-zinc-700 ${
                href
                  ? "transition-[background-color,border-color] duration-300 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:border-zinc-700 group-hover:bg-white dark:group-hover:border-zinc-300 dark:group-hover:bg-zinc-900"
                  : ""
              }`
        }`}
      >
        <Icon
          className={`h-5 w-5 ${
            iconStyle === "filled"
              ? `text-white dark:text-zinc-900 ${
                  href
                    ? "transition-[color] duration-300 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:text-zinc-900 dark:group-hover:text-white"
                    : ""
                }`
              : `text-zinc-600 dark:text-zinc-400 ${
                  href
                    ? "transition-[color] duration-300 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:text-zinc-900 dark:group-hover:text-white"
                    : ""
                }`
          }`}
        />
      </div>
      <div
        className={`font-medium text-zinc-900 dark:text-zinc-50 ${
          href
            ? "transition-[color] duration-300 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:text-white dark:group-hover:text-zinc-900"
            : ""
        }`}
      >
        {title}
      </div>
      <div
        className={`text-sm text-zinc-500 dark:text-zinc-400 ${
          href
            ? "transition-[color] duration-300 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:text-zinc-300 dark:group-hover:text-zinc-600"
            : ""
        }`}
      >
        {value}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group block">
        {content}
      </Link>
    );
  }

  return content;
}
