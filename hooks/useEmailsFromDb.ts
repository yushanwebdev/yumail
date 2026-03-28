import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getEmailsByDate } from '@/db/emailQueries';
import { deltaSync } from '@/db/syncEngine';

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function useEmailsFromDb(selectedDate: Date) {
  const queryClient = useQueryClient();
  const dateStr = toDateString(selectedDate);

  const { data: emails = [], isLoading: loading, isRefetching: refreshing, refetch } = useQuery({
    queryKey: ['emails-local', dateStr],
    queryFn: () => getEmailsByDate(dateStr),
    staleTime: Infinity,
  });

  const { total, readCount } = useMemo(
    () => ({
      total: emails.length,
      readCount: emails.filter((e) => !e.unread).length,
    }),
    [emails],
  );

  const handleRefresh = async () => {
    try {
      const newCount = await deltaSync();
      if (newCount > 0) {
        queryClient.invalidateQueries({ queryKey: ['emails-local'] });
      }
    } catch (e) {
      console.warn('Delta sync on refresh failed:', e);
    }
    refetch();
  };

  return {
    emails,
    loading,
    refreshing,
    total,
    readCount,
    refetch: handleRefresh,
    invalidate: () => queryClient.invalidateQueries({ queryKey: ['emails-local'] }),
  };
}
