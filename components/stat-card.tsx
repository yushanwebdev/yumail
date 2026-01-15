import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface StatCardProps {
  href?: string;
  icon: LucideIcon;
  iconStyle?: "filled" | "outlined";
  color?: "default" | "emerald" | "blue";
  title: string;
  value: ReactNode;
}

export function StatCard({
  href,
  icon: Icon,
  iconStyle = "outlined",
  color = "default",
  title,
  value,
}: StatCardProps) {
  const colorStyles = {
    default: {
      card: href
        ? "transition-[background-color,border-color] duration-300 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:border-zinc-900 group-hover:bg-zinc-900 dark:group-hover:border-zinc-100 dark:group-hover:bg-zinc-100"
        : "",
      iconFilled: "bg-zinc-900 dark:bg-zinc-100",
      iconFilledHover: href
        ? "transition-[background-color,border-color] duration-300 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:bg-white dark:group-hover:bg-zinc-900"
        : "",
      iconOutlined: "border-zinc-200 dark:border-zinc-700",
      iconOutlinedHover: href
        ? "transition-[background-color,border-color] duration-300 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:border-zinc-700 group-hover:bg-white dark:group-hover:border-zinc-300 dark:group-hover:bg-zinc-900"
        : "",
      iconColor: iconStyle === "filled" ? "text-white dark:text-zinc-900" : "text-zinc-600 dark:text-zinc-400",
      iconColorHover: href
        ? "transition-[color] duration-300 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:text-zinc-900 dark:group-hover:text-white"
        : "",
      titleHover: href
        ? "transition-[color] duration-300 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:text-white dark:group-hover:text-zinc-900"
        : "",
      valueHover: href
        ? "transition-[color] duration-300 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:text-zinc-300 dark:group-hover:text-zinc-600"
        : "",
    },
    emerald: {
      card: href
        ? "transition-[background-color,border-color] duration-300 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:border-emerald-500 group-hover:bg-emerald-500 dark:group-hover:border-emerald-500 dark:group-hover:bg-emerald-500"
        : "",
      iconFilled: "bg-emerald-500",
      iconFilledHover: href
        ? "transition-[background-color,border-color] duration-300 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:bg-white dark:group-hover:bg-emerald-900"
        : "",
      iconOutlined: "border-emerald-200 dark:border-emerald-800",
      iconOutlinedHover: href
        ? "transition-[background-color,border-color] duration-300 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:border-emerald-300 group-hover:bg-white dark:group-hover:border-emerald-600 dark:group-hover:bg-emerald-900"
        : "",
      iconColor: iconStyle === "filled" ? "text-white" : "text-emerald-600 dark:text-emerald-400",
      iconColorHover: href
        ? "transition-[color] duration-300 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:text-emerald-600 dark:group-hover:text-white"
        : "",
      titleHover: href
        ? "transition-[color] duration-300 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:text-white dark:group-hover:text-white"
        : "",
      valueHover: href
        ? "transition-[color] duration-300 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:text-emerald-100 dark:group-hover:text-emerald-200"
        : "",
    },
    blue: {
      card: href
        ? "transition-[background-color,border-color] duration-300 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:border-blue-500 group-hover:bg-blue-500 dark:group-hover:border-blue-500 dark:group-hover:bg-blue-500"
        : "",
      iconFilled: "bg-blue-500",
      iconFilledHover: href
        ? "transition-[background-color,border-color] duration-300 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:bg-white dark:group-hover:bg-blue-900"
        : "",
      iconOutlined: "border-blue-200 dark:border-blue-800",
      iconOutlinedHover: href
        ? "transition-[background-color,border-color] duration-300 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:border-blue-300 group-hover:bg-white dark:group-hover:border-blue-600 dark:group-hover:bg-blue-900"
        : "",
      iconColor: iconStyle === "filled" ? "text-white" : "text-blue-600 dark:text-blue-400",
      iconColorHover: href
        ? "transition-[color] duration-300 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:text-blue-600 dark:group-hover:text-white"
        : "",
      titleHover: href
        ? "transition-[color] duration-300 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:text-white dark:group-hover:text-white"
        : "",
      valueHover: href
        ? "transition-[color] duration-300 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:text-blue-100 dark:group-hover:text-blue-200"
        : "",
    },
  };

  const styles = colorStyles[color];

  const content = (
    <div
      className={`rounded-xl border border-zinc-200 p-4 dark:border-zinc-800 ${styles.card}`}
    >
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center ${
          iconStyle === "filled"
            ? `rounded-full ${styles.iconFilled} ${styles.iconFilledHover}`
            : `rounded-lg border ${styles.iconOutlined} ${styles.iconOutlinedHover}`
        }`}
      >
        <Icon
          className={`h-5 w-5 ${styles.iconColor} ${styles.iconColorHover}`}
        />
      </div>
      <div
        className={`font-medium text-zinc-900 dark:text-zinc-50 ${styles.titleHover}`}
      >
        {title}
      </div>
      <div
        className={`text-sm text-zinc-500 dark:text-zinc-400 ${styles.valueHover}`}
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
