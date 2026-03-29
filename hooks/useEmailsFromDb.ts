import { useCallback, useMemo, useReducer, useState } from 'react';
import { getEmailsByDate } from '@/db/emailQueries';
import { deltaSync } from '@/db/syncEngine';

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function useEmailsFromDb(selectedDate: Date) {
  const [version, bump] = useReducer((n: number) => n + 1, 0);
  const [refreshing, setRefreshing] = useState(false);
  const dateStr = toDateString(selectedDate);

  // Re-reads from SQLite whenever date or version changes
  const emails = useMemo(
    () => getEmailsByDate(dateStr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dateStr, version],
  );

  const total = emails.length;
  const readCount = useMemo(() => emails.filter((e) => !e.unread).length, [emails]);

  const refetch = useCallback(async () => {
    setRefreshing(true);
    try {
      await deltaSync();
    } catch (e) {
      console.warn('Delta sync on refresh failed:', e);
    }
    bump();
    setRefreshing(false);
  }, []);

  return {
    emails,
    loading: false,
    refreshing,
    total,
    readCount,
    refetch,
    invalidate: bump,
  };
}
