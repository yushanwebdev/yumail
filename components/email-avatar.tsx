import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, getDisplayName } from "@/lib/utils";

interface EmailAvatarProps {
  email: string;
  name: string;
  className?: string;
}

function getRootDomain(email: string): string {
  const domain = email.split("@")[1];
  const parts = domain.split(".");
  // Get root domain (e.g., "example.com" from "mail.example.com")
  return parts.length > 2 ? parts.slice(-2).join(".") : domain;
}

function getAvatarUrl(email: string): string {
  const rootDomain = getRootDomain(email);
  const googleFallback = encodeURIComponent(
    `https://www.google.com/s2/favicons?domain=${rootDomain}&sz=128`
  );
  return `https://unavatar.io/${email}?fallback=${googleFallback}`;
}

export function EmailAvatar({
  email,
  name,
  className = "h-10 w-10",
}: EmailAvatarProps) {
  const displayName = getDisplayName(name, email);

  return (
    <Avatar className={className}>
      <AvatarImage src={getAvatarUrl(email)} alt={displayName} />
      <AvatarFallback className="bg-zinc-900 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
        {getInitials(displayName)}
      </AvatarFallback>
    </Avatar>
  );
}
