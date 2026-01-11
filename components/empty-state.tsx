import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
        <Icon className="h-8 w-8 text-zinc-400" />
      </div>
      <p className="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-50">
        {title}
      </p>
      {description && (
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      )}
    </div>
  );
}
