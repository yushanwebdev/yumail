import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl, getInitials, getDisplayName } from "@/lib/utils";

interface EmailAvatarProps {
  email: string;
  name: string;
  className?: string;
}

export function EmailAvatar({ email, name, className = "h-10 w-10" }: EmailAvatarProps) {
  const displayName = getDisplayName(name, email);

  return (
    <Avatar className={className}>
      <AvatarImage
        src={getAvatarUrl(email)}
        alt={displayName}
      />
      <AvatarFallback className="bg-zinc-900 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
        {getInitials(displayName)}
      </AvatarFallback>
    </Avatar>
  );
}
