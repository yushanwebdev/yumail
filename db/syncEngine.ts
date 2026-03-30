import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseDate } from '@/api/resend';
import type { EmailsPage } from '@/api/resend';
import { insertEmails, emailExists, getSyncMeta, setSyncMeta } from './emailQueries';
import { getDatabase } from './database';
import type { DbEmail } from './types';

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

async function fetchResendPage(limit: number, after?: string): Promise<ResendListResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (after) params.set('after', after);
  const res = await fetch(`${RESEND_BASE_URL}?${params}`, {
    headers: { Authorization: `Bearer ${RESEND_API_KEY}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function toDbEmail(email: { id: string; from: string; subject: string; createdAt?: string }): DbEmail {
  const parsed = email.createdAt ? parseDate(email.createdAt) : null;
  const ms = parsed ? parsed.getTime() : 0;
  const createdDate = parsed ? toLocalDateString(parsed) : '1970-01-01';

  return {
    id: email.id,
    from_address: email.from,
    subject: email.subject || '(No subject)',
    snippet: '',
    created_date: createdDate,
    created_at_ms: ms,
    is_read: 0,
  };
}

/**
 * Called by useSync for each page fetched via React Query.
 * Stores the page's emails into SQLite.
 */
export function storePageToDb(page: EmailsPage): void {
  if (page.emails.length === 0) return;
  const dbEmails = page.emails.map(toDbEmail);
  insertEmails(dbEmails);
}

/**
 * Called after all pages have been fetched and stored.
 * Marks the initial sync as complete.
 */
export function finishSync(): void {
  setSyncMeta('initial_sync_complete', 'true');
}

/**
 * Delta sync: fetch newest emails from the API until we hit one already in the DB.
 */
export async function deltaSync(): Promise<number> {
  let inserted = 0;
  let cursor: string | undefined;

  while (true) {
    const response = await fetchResendPage(PAGE_SIZE, cursor);
    if (!response.data || response.data.length === 0) break;

    let hitExisting = false;
    const newEmails: DbEmail[] = [];

    for (const resend of response.data) {
      if (emailExists(resend.id)) {
        hitExisting = true;
        break;
      }
      const parsed = parseDate(resend.created_at);
      const ms = parsed ? parsed.getTime() : 0;
      const createdDate = parsed ? toLocalDateString(parsed) : '1970-01-01';
      newEmails.push({
        id: resend.id,
        from_address: resend.from,
        subject: resend.subject || '(No subject)',
        snippet: '',
        created_date: createdDate,
        created_at_ms: ms,
        is_read: 0,
      });
    }

    if (newEmails.length > 0) {
      insertEmails(newEmails);
      inserted += newEmails.length;
    }

    if (hitExisting || !response.has_more) break;
    cursor = response.data[response.data.length - 1].id;
  }

  return inserted;
}

/**
 * One-time migration of read status from AsyncStorage to SQLite.
 */
export async function migrateReadStatus(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem('read-status');
    if (!raw) return;

    const parsed = JSON.parse(raw);
    const readIds: string[] = parsed?.state?.readIds ?? [];
    if (readIds.length === 0) return;

    const db = getDatabase();
    db.withTransactionSync(() => {
      for (const id of readIds) {
        db.runSync('UPDATE emails SET is_read = 1 WHERE id = ?', [id]);
      }
    });

    await AsyncStorage.removeItem('read-status');
  } catch {
    // Migration is best-effort — don't block sync on failure
  }
}
