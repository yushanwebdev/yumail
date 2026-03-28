import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { initialSync, type SyncProgress } from '@/db/syncEngine';

export function useSync() {
  const router = useRouter();
  const [progress, setProgress] = useState<SyncProgress>({
    phase: 'fetching',
    emailsFetched: 0,
    pagesProcessed: 0,
  });

  const runSync = useCallback(async () => {
    try {
      setProgress({ phase: 'fetching', emailsFetched: 0, pagesProcessed: 0 });
      await initialSync(setProgress);
      router.replace('/');
    } catch (err) {
      setProgress((prev) => ({
        ...prev,
        phase: 'error',
        error: err instanceof Error ? err.message : 'Sync failed',
      }));
    }
  }, [router]);

  useEffect(() => {
    runSync();
  }, [runSync]);

  return { progress, retry: runSync };
}
