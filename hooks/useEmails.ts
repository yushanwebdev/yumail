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

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  // Normalize Resend's format "2026-03-15 13:08:03.161658+00" to ISO 8601
  const normalized = dateStr
    .replace(' ', 'T')              // space -> T
    .replace(/\+(\d{2})$/, '+$1:00') // +00 -> +00:00
    .replace(/-(\d{2})$/, '-$1:00'); // -00 -> -00:00
  let ts = Date.parse(normalized);
  if (!isNaN(ts)) return new Date(ts);
  // Manual fallback for Hermes
  const m = normalized.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-]\d{2}:\d{2})?$/);
  if (!m) return null;
  const [, yr, mo, dy, hr, mn, sc, tz] = m;
  if (!tz || tz === 'Z' || tz === '+00:00') {
    return new Date(Date.UTC(+yr, +mo - 1, +dy, +hr, +mn, +sc));
  }
  const sign = tz[0] === '+' ? -1 : 1;
  const [oh, om] = tz.slice(1).split(':').map(Number);
  return new Date(Date.UTC(+yr, +mo - 1, +dy, +hr + sign * oh, +mn + sign * om, +sc));
}

function formatDate(dateStr: string): string {
  const date = parseDate(dateStr);
  if (!date) return '';

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfDay.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    const m = minutes.toString().padStart(2, '0');
    return `${h}:${m} ${ampm}`;
  }
  if (diffDays === 1) {
    return 'Yesterday';
  }
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
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
