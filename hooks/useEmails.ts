import { useCallback, useEffect, useState } from 'react';
import { emails as mockEmails, type Email } from '@/constants/emails';

type ResendEmail = {
  id: string;
  from: string;
  to: string[];
  subject: string;
  created_at: string;
  bcc: string[];
  cc: string[];
  reply_to: string[];
  message_id: string;
  attachments: { id: string; filename: string; content_type: string; size: number }[];
};

type ResendListResponse = {
  object: string;
  has_more: boolean;
  data: ResendEmail[];
};

function extractSenderName(from: string): string {
  // "Name <email@example.com>" → "Name"
  const match = from.match(/^(.+?)\s*<.+>$/);
  return match ? match[1].trim() : from.split('@')[0];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  if (diffDays === 1) {
    return 'Yesterday';
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function toEmail(resendEmail: ResendEmail): Email {
  return {
    id: resendEmail.id,
    sender: extractSenderName(resendEmail.from),
    subject: resendEmail.subject || '(No subject)',
    snippet: '',
    date: formatDate(resendEmail.created_at),
    unread: true,
  };
}

export function useEmails() {
  const [emails, setEmails] = useState<Email[]>(mockEmails);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/emails');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const body: ResendListResponse = await res.json();
      if (body.data && body.data.length > 0) {
        setEmails(body.data.map(toEmail));
      }
      // If empty response, keep mock data as fallback
    } catch (err) {
      console.warn('Failed to fetch emails from Resend, using mock data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Keep mock data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  return { emails, loading, error, refetch: fetchEmails };
}
