export interface EmailAddress {
  email: string;
  name: string;
}

export interface Email {
  id: string;
  from: EmailAddress;
  to: EmailAddress[];
  subject: string;
  body: string;
  htmlBody?: string;
  timestamp: Date;
  isRead: boolean;
  folder: "inbox" | "sent";
}

export interface EmailStats {
  totalInbox: number;
  totalSent: number;
  unreadCount: number;
  todayCount: number;
}

export interface SenderStats {
  sender: EmailAddress;
  count: number;
}

export type ComposeMode = "new" | "reply" | "forward";

export interface ComposeState {
  mode: ComposeMode;
  originalEmail?: Email;
}
