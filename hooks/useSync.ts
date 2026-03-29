import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { fetchEmailsPage, type EmailsPage } from '@/hooks/useEmails';
import { storePageToDb, finishSync, migrateReadStatus } from '@/db/syncEngine';

type SyncPhase = 'fetching' | 'migrating' | 'complete' | 'error';

export function useSync() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<SyncPhase>('fetching');
  const [error, setError] = useState<string>();
  const migratingRef = useRef(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useInfiniteQuery<EmailsPage>({
    queryKey: ['sync-emails'],
    queryFn: async (ctx) => {
      const page = await fetchEmailsPage(ctx);
      storePageToDb(page);
      return page;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
  });

  const emailsFetched = useMemo(
    () => data?.pages.reduce((sum, p) => sum + p.emails.length, 0) ?? 0,
    [data],
  );

  // Auto-fetch all remaining pages
  useEffect(() => {
    if (isLoading || isFetchingNextPage || !hasNextPage || phase !== 'fetching') return;
    fetchNextPage();
  }, [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, phase]);

  // All pages fetched — run migration and mark complete
  useEffect(() => {
    if (phase !== 'fetching') return;
    if (isLoading || isFetchingNextPage || hasNextPage) return;
    if (migratingRef.current) return;
    migratingRef.current = true;

    (async () => {
      try {
        setPhase('migrating');
        await migrateReadStatus();
        finishSync();
        setPhase('complete');
        queryClient.removeQueries({ queryKey: ['sync-emails'] });
        router.replace('/');
      } catch (err) {
        setPhase('error');
        setError(err instanceof Error ? err.message : 'Migration failed');
      }
    })();
  }, [isLoading, isFetchingNextPage, hasNextPage, phase, router, queryClient]);

  // Handle query errors
  useEffect(() => {
    if (isError) {
      setPhase('error');
      setError(queryError instanceof Error ? queryError.message : 'Sync failed');
    }
  }, [isError, queryError]);

  const retry = useCallback(() => {
    setPhase('fetching');
    setError(undefined);
    migratingRef.current = false;
    refetch();
  }, [refetch]);

  return {
    phase,
    emailsFetched,
    error,
    retry,
  };
}
