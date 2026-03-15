import { useCallback, useEffect, useState } from 'react';

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
  const [email, setEmail] = useState<EmailDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const detail = await fetchEmailDetail(id);
      setEmail(detail);
    } catch (err) {
      console.warn('Failed to fetch email detail:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  return { email, loading, error, refetch: fetch_ };
}
