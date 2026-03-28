import { useMemo } from 'react';
import { useEmails, parseDate } from './useEmails';
import type { Email } from '@/constants/emails';
import { isRead } from '@/stores/useReadStatusStore';

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function filterByDate(emails: Email[], selected: Date): Email[] {
  return emails.filter((e) => {
    if (e.createdAt) {
      const d = parseDate(e.createdAt);
      if (d) return isSameDay(d, selected);
    }
    return false;
  });
}

export function useInboxEmails(selectedDate: Date) {
  const { emails: allEmails, refreshing, refetch, loading } = useEmails(selectedDate);

  const emails = useMemo(() => {
    const withRead = allEmails.map((e) => ({ ...e, unread: !isRead(e.id) }));
    return filterByDate(withRead, selectedDate);
  }, [allEmails, selectedDate]);

  return {
    emails,
    loading,
    refreshing,
    total: emails.length,
    readCount: emails.filter((e) => !e.unread).length,
    refetch,
    invalidate: () => {},
  };
}
