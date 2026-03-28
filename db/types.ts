export type DbEmail = {
  id: string;
  sender: string;
  from_address: string;
  subject: string;
  snippet: string;
  date_display: string;
  created_at: string;
  created_date: string;
  created_at_ms: number;
  is_read: number;
  message_id: string | null;
  has_attachments: number;
};
