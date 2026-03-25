import { useEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { emails as mockEmails, type Email } from '@/constants/emails';

const MAX_AUTO_FETCHES = 5;
const PAGE_SIZE = 20;

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

export type EmailsPage = {
  emails: Email[];
  hasMore: boolean;
  nextCursor: string | null;
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
  const match = from.match(/^(.+?)\s*<.+>$/);
  return match ? match[1].trim() : from.split('@')[0];
}

export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const normalized = dateStr
    .replace(' ', 'T')
    .replace(/\+(\d{2})$/, '+$1:00')
    .replace(/-(\d{2})$/, '-$1:00');
  let ts = Date.parse(normalized);
  if (!isNaN(ts)) return new Date(ts);
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

export function formatBucket(dateStr: string): string {
  const date = parseDate(dateStr);
  if (!date) return '';

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfDayDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
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

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function haveFetchedPastDate(emails: Email[], date: Date): boolean {
  if (emails.length === 0) return false;
  const last = emails[emails.length - 1];
  if (!last.createdAt) return false;
  const emailDate = parseDate(last.createdAt);
  if (!emailDate) return false;
  return startOfDay(emailDate) < startOfDay(date);
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

export async function fetchEmailsPage(context: { pageParam: unknown }): Promise<EmailsPage> {
  const body = await fetchResendEmails(PAGE_SIZE, context.pageParam as string | undefined);
  const emails = body.data?.length > 0 ? body.data.map(toEmail) : [];
  const nextCursor = body.data?.length > 0 ? body.data[body.data.length - 1].id : null;
  return { emails, hasMore: body.has_more ?? false, nextCursor };
}

export function useEmails(selectedDate: Date) {
  const [dateExhausted, setDateExhausted] = useState(false);
  const autoFetchCountRef = useRef(0);

  const {
    data,
    isLoading: loading,
    isRefetching: refreshing,
    isFetchingNextPage: loadingMore,
    hasNextPage: hasMore,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery<EmailsPage>({
    queryKey: ['emails'],
    queryFn: fetchEmailsPage,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
  });

  const emails = useMemo(
    () => data?.pages.flatMap((page) => page.emails) ?? [],
    [data],
  );

  // Reset auto-fetch tracking when selected date changes
  const selectedDayTs = startOfDay(selectedDate);
  const prevDayTsRef = useRef(selectedDayTs);
  useEffect(() => {
    if (prevDayTsRef.current !== selectedDayTs) {
      prevDayTsRef.current = selectedDayTs;
      autoFetchCountRef.current = 0;
      setDateExhausted(false);
    }
  }, [selectedDayTs]);

  // Auto-fetch pages until the selected date is covered
  useEffect(() => {
    if (loading || refreshing || loadingMore || dateExhausted) return;
    if (!hasMore) {
      setDateExhausted(true);
      return;
    }
    if (haveFetchedPastDate(emails, selectedDate)) {
      setDateExhausted(true);
      return;
    }
    if (autoFetchCountRef.current >= MAX_AUTO_FETCHES) {
      setDateExhausted(true);
      return;
    }
    autoFetchCountRef.current += 1;
    fetchNextPage();
  }, [emails, loading, refreshing, loadingMore, hasMore, dateExhausted, selectedDate, fetchNextPage]);

  const fetchMore = () => {
    if (hasMore && !loadingMore) fetchNextPage();
  };

  return { emails, loading, refreshing, loadingMore, hasMore: !!hasMore, dateExhausted, refetch, fetchMore };
}
