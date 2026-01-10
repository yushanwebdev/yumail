import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "blue";
}

export function Badge({ children, variant = "default" }: BadgeProps) {
  const variants = {
    default:
      "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  };

  return (
    <div
      className={`rounded-full px-3 py-1 text-sm font-medium ${variants[variant]}`}
    >
      {children}
    </div>
  );
}
