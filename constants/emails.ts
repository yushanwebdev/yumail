export type Email = {
  id: string;
  sender: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
  createdAt?: string;
  unread: boolean;
};
