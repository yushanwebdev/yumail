import type { Email } from '@/constants/emails';

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
  attachments: {
    id: string;
    filename: string;
    content_type: string;
    size: number;
  }[];
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

export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const normalized = dateStr
    .replace(' ', 'T')
    .replace(/\+(\d{2})$/, '+$1:00')
    .replace(/-(\d{2})$/, '-$1:00');
  const ts = Date.parse(normalized);
  if (!isNaN(ts)) return new Date(ts);
  const m = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-]\d{2}:\d{2})?$/,
  );
  if (!m) return null;
  const [, yr, mo, dy, hr, mn, sc, tz] = m;
  if (!tz || tz === 'Z' || tz === '+00:00') {
    return new Date(Date.UTC(+yr, +mo - 1, +dy, +hr, +mn, +sc));
  }
  const sign = tz[0] === '+' ? -1 : 1;
  const [oh, om] = tz.slice(1).split(':').map(Number);
  return new Date(
    Date.UTC(+yr, +mo - 1, +dy, +hr + sign * oh, +mn + sign * om, +sc),
  );
}

function extractSenderName(from: string): string {
  const match = from.match(/^(.+?)\s*<.+>$/);
  return match ? match[1].trim() : from.split('@')[0];
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

async function fetchResendEmails(
  limit: number,
  after?: string,
): Promise<ResendListResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (after) params.set('after', after);
  const res = await fetch(`${RESEND_BASE_URL}?${params}`, {
    headers: { Authorization: `Bearer ${RESEND_API_KEY}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchEmailsPage(context: {
  pageParam: unknown;
}): Promise<EmailsPage> {
  const body = await fetchResendEmails(
    PAGE_SIZE,
    context.pageParam as string | undefined,
  );
  const emails = body.data?.length > 0 ? body.data.map(toEmail) : [];
  const nextCursor =
    body.data?.length > 0 ? body.data[body.data.length - 1].id : null;
  return { emails, hasMore: body.has_more ?? false, nextCursor };
}
