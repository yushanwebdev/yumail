import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseDate } from '@/hooks/useEmails';
import { insertEmails, emailExists, getSyncMeta, setSyncMeta } from './emailQueries';
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

export type SyncProgress = {
  phase: 'fetching' | 'migrating' | 'complete' | 'error';
  emailsFetched: number;
  pagesProcessed: number;
  error?: string;
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

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function toDbEmail(resend: ResendEmail): DbEmail {
  const parsed = parseDate(resend.created_at);
  const ms = parsed ? parsed.getTime() : 0;
  const createdDate = parsed ? toLocalDateString(parsed) : '1970-01-01';

  return {
    id: resend.id,
    from_address: resend.from,
    subject: resend.subject || '(No subject)',
    snippet: '',
    created_date: createdDate,
    created_at_ms: ms,
    is_read: 0,
  };
}

export async function initialSync(
  onProgress: (progress: SyncProgress) => void,
): Promise<void> {
  let cursor = getSyncMeta('last_sync_cursor') ?? undefined;
  let totalFetched = 0;
  let pagesProcessed = 0;

  // Count emails already inserted from a previous partial sync
  const existingCursor = getSyncMeta('last_sync_cursor');
  if (existingCursor) {
    const countMeta = getSyncMeta('partial_sync_count');
    totalFetched = countMeta ? parseInt(countMeta, 10) : 0;
  }

  while (true) {
    const response = await fetchResendPage(PAGE_SIZE, cursor);
    const dbEmails = (response.data ?? []).map(toDbEmail);
    if (dbEmails.length > 0) {
      insertEmails(dbEmails);
    }

    totalFetched += dbEmails.length;
    pagesProcessed += 1;
    onProgress({ phase: 'fetching', emailsFetched: totalFetched, pagesProcessed });

    if (!response.has_more || dbEmails.length === 0) break;

    cursor = response.data[response.data.length - 1].id;
    setSyncMeta('last_sync_cursor', cursor);
    setSyncMeta('partial_sync_count', String(totalFetched));
  }

  // Store newest email timestamp for delta sync
  if (totalFetched > 0) {
    const firstPageResponse = await fetchResendPage(1);
    if (firstPageResponse.data?.length > 0) {
      setSyncMeta('newest_email_id', firstPageResponse.data[0].id);
    }
  }

  // Migrate read status from AsyncStorage
  onProgress({ phase: 'migrating', emailsFetched: totalFetched, pagesProcessed });
  await migrateReadStatus();

  // Mark sync complete and clean up partial tracking
  setSyncMeta('initial_sync_complete', 'true');
  setSyncMeta('last_sync_cursor', '');
  setSyncMeta('partial_sync_count', '');

  onProgress({ phase: 'complete', emailsFetched: totalFetched, pagesProcessed });
}

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
      newEmails.push(toDbEmail(resend));
    }

    if (newEmails.length > 0) {
      insertEmails(newEmails);
      inserted += newEmails.length;
    }

    if (hitExisting || !response.has_more) break;
    cursor = response.data[response.data.length - 1].id;
  }

  if (inserted > 0) {
    const newest = await fetchResendPage(1);
    if (newest.data?.length > 0) {
      setSyncMeta('newest_email_id', newest.data[0].id);
    }
  }

  return inserted;
}

async function migrateReadStatus(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem('read-status');
    if (!raw) return;

    const parsed = JSON.parse(raw);
    const readIds: string[] = parsed?.state?.readIds ?? [];
    if (readIds.length === 0) return;

    const { getDatabase } = await import('./database');
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
