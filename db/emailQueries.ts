import type { Email } from '@/constants/emails';
import { getDatabase } from './database';
import type { DbEmail } from './types';

const INSERT_BATCH_SIZE = 100;

function toEmail(row: DbEmail): Email {
  return {
    id: row.id,
    sender: row.sender,
    from: row.from_address,
    subject: row.subject,
    snippet: row.snippet,
    date: row.date_display,
    createdAt: row.created_at,
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
            (id, sender, from_address, subject, snippet, date_display,
             created_at, created_date, created_at_ms, is_read, message_id, has_attachments)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            e.id,
            e.sender,
            e.from_address,
            e.subject,
            e.snippet,
            e.date_display,
            e.created_at,
            e.created_date,
            e.created_at_ms,
            e.is_read,
            e.message_id,
            e.has_attachments,
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
