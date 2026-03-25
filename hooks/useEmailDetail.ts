import { useQuery } from '@tanstack/react-query';

const RESEND_API_KEY = process.env.EXPO_PUBLIC_RESEND_API_KEY;
const RESEND_BASE_URL = 'https://api.resend.com/emails/receiving';

export type EmailDetail = {
  id: string;
  from: string;
  to: string[];
  subject: string;
  created_at: string;
  html: string;
  text: string;
  bcc: string[];
  cc: string[];
  reply_to: string[];
  message_id: string;
  attachments: { id: string; filename: string; content_type: string; size: number }[];
};

async function fetchEmailDetail(id: string): Promise<EmailDetail> {
  const res = await fetch(`${RESEND_BASE_URL}/${id}`, {
    headers: { Authorization: `Bearer ${RESEND_API_KEY}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function useEmailDetail(id: string) {
  const { data: email = null, isLoading: loading, error, refetch } = useQuery<EmailDetail>({
    queryKey: ['email', id],
    queryFn: () => fetchEmailDetail(id),
    enabled: !!id,
  });

  return { email, loading, error: error?.message ?? null, refetch };
}
