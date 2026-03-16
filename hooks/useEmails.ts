import { useCallback, useEffect, useRef, useState } from 'react';
import { emails as mockEmails, type Email } from '@/constants/emails';

const RESEND_API_KEY = process.env.EXPO_PUBLIC_RESEND_API_KEY;
const RESEND_BASE_URL = 'https://api.resend.com/emails/receiving';

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

async function fetchResendEmails(limit: number, after?: string): Promise<ResendListResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (after) params.set('after', after);
  const res = await fetch(`${RESEND_BASE_URL}?${params}`, {
    headers: { Authorization: `Bearer ${RESEND_API_KEY}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

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

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  const m = minutes.toString().padStart(2, '0');
  return `${h}:${m} ${ampm}`;
}

export function formatBucket(dateStr: string): string {
  const date = parseDate(dateStr);
  if (!date) return '';

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfDay.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

function toEmail(resendEmail: ResendEmail): Email {
  return {
    id: resendEmail.id,
    sender: extractSenderName(resendEmail.from),
    from: resendEmail.from,
    subject: resendEmail.subject || '(No subject)',
    snippet: '',
    date: formatDate(resendEmail.created_at),
    createdAt: resendEmail.created_at,
    unread: true,
  };
}

export function useEmails() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef<string | null>(null);

  const fetchEmails = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    cursorRef.current = null;
    try {
      const body = await fetchResendEmails(20);
      if (body.data && body.data.length > 0) {
        setEmails(body.data.map(toEmail));
        cursorRef.current = body.data[body.data.length - 1].id;
      }
      setHasMore(body.has_more ?? false);
    } catch (err) {
      console.warn('Failed to fetch emails from Resend, using mock data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setEmails(mockEmails);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchMore = useCallback(async () => {
    if (loadingMore || !hasMore || !cursorRef.current) return;
    setLoadingMore(true);
    try {
      const body = await fetchResendEmails(20, cursorRef.current!);
      if (body.data && body.data.length > 0) {
        setEmails((prev) => [...prev, ...body.data.map(toEmail)]);
        cursorRef.current = body.data[body.data.length - 1].id;
      }
      setHasMore(body.has_more ?? false);
    } catch (err) {
      console.warn('Failed to fetch more emails:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const refetch = useCallback(() => fetchEmails(true), [fetchEmails]);

  return { emails, loading, refreshing, loadingMore, error, hasMore, refetch, fetchMore };
}
