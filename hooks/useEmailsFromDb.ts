import { useCallback, useEffect, useMemo, useState } from 'react';
import { addDatabaseChangeListener } from 'expo-sqlite';
import { getEmailsByDate } from '@/db/emailQueries';
import { deltaSync } from '@/db/syncEngine';

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function useEmailsFromDb(selectedDate: Date) {
  const [refreshing, setRefreshing] = useState(false);
  const dateStr = toDateString(selectedDate);

  const [emails, setEmails] = useState(() => getEmailsByDate(dateStr));

  useEffect(() => {
    setEmails(getEmailsByDate(dateStr));
    const sub = addDatabaseChangeListener((event) => {
      if (event.tableName === 'emails') {
        setEmails(getEmailsByDate(dateStr));
      }
    });
    return () => sub.remove();
  }, [dateStr]);

  const total = emails.length;
  const readCount = useMemo(() => emails.filter((e) => !e.unread).length, [emails]);

  const refetch = useCallback(async () => {
    setRefreshing(true);
    try {
      await deltaSync();
    } catch (e) {
      console.warn('Delta sync on refresh failed:', e);
    }
    setRefreshing(false);
  }, []);

  return {
    emails,
    loading: false,
    refreshing,
    total,
    readCount,
    refetch,
  };
}
