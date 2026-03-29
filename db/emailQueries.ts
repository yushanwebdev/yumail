import type { Email } from '@/constants/emails';
import { getDatabase } from './database';
import type { DbEmail } from './types';

const INSERT_BATCH_SIZE = 100;

function extractSenderName(from: string): string {
  const match = from.match(/^(.+?)\s*<.+>$/);
  return match ? match[1].trim() : from.split('@')[0];
}

function formatTime(ms: number): string {
  const d = new Date(ms);
  const h = d.getHours() % 12 || 12;
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = d.getHours() >= 12 ? 'PM' : 'AM';
  return `${h}:${m} ${ampm}`;
}

function toEmail(row: DbEmail): Email {
  return {
    id: row.id,
    sender: extractSenderName(row.from_address),
    from: row.from_address,
    subject: row.subject,
    snippet: row.snippet,
    date: formatTime(row.created_at_ms),
    unread: row.is_read === 0,
  };
}

export function insertEmails(emails: DbEmail[]): void {
  const db = getDatabase();
  for (let i = 0; i < emails.length; i += INSERT_BATCH_SIZE) {
    const batch = emails.slice(i, i + INSERT_BATCH_SIZE);
    db.withTransactionSync(() => {
      for (const e of batch) {
        db.runSync(
          `INSERT OR IGNORE INTO emails
            (id, from_address, subject, snippet, created_date, created_at_ms, is_read)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            e.id,
            e.from_address,
            e.subject,
            e.snippet,
            e.created_date,
            e.created_at_ms,
            e.is_read,
          ],
        );
      }
    });
  }
}

export function getEmailsByDate(dateStr: string): Email[] {
  const db = getDatabase();
  const rows = db.getAllSync<DbEmail>(
    'SELECT * FROM emails WHERE created_date = ? ORDER BY created_at_ms DESC',
    [dateStr],
  );
  return rows.map(toEmail);
}

export function getEmailCountForDate(dateStr: string): { total: number; read: number } {
  const db = getDatabase();
  const row = db.getFirstSync<{ total: number; read_count: number }>(
    'SELECT COUNT(*) as total, SUM(is_read) as read_count FROM emails WHERE created_date = ?',
    [dateStr],
  );
  return { total: row?.total ?? 0, read: row?.read_count ?? 0 };
}

export function emailExists(id: string): boolean {
  const db = getDatabase();
  const row = db.getFirstSync<{ cnt: number }>(
    'SELECT COUNT(*) as cnt FROM emails WHERE id = ?',
    [id],
  );
  return (row?.cnt ?? 0) > 0;
}

export function markAsRead(id: string): void {
  getDatabase().runSync('UPDATE emails SET is_read = 1 WHERE id = ?', [id]);
}

export function toggleRead(id: string): void {
  getDatabase().runSync(
    'UPDATE emails SET is_read = CASE WHEN is_read = 1 THEN 0 ELSE 1 END WHERE id = ?',
    [id],
  );
}

export function isRead(id: string): boolean {
  const row = getDatabase().getFirstSync<{ is_read: number }>(
    'SELECT is_read FROM emails WHERE id = ?',
    [id],
  );
  return row?.is_read === 1;
}

export function getSyncMeta(key: string): string | null {
  const row = getDatabase().getFirstSync<{ value: string }>(
    'SELECT value FROM sync_meta WHERE key = ?',
    [key],
  );
  return row?.value ?? null;
}

export function setSyncMeta(key: string, value: string): void {
  getDatabase().runSync(
    'INSERT OR REPLACE INTO sync_meta (key, value) VALUES (?, ?)',
    [key, value],
  );
}
