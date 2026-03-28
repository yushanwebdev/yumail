import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { deltaSync } from '@/db/syncEngine';

export function useSyncOnForeground() {
  const queryClient = useQueryClient();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', async (nextState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        try {
          const newCount = await deltaSync();
          if (newCount > 0) {
            queryClient.invalidateQueries({ queryKey: ['emails-local'] });
          }
        } catch (e) {
          console.warn('Delta sync failed:', e);
        }
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, [queryClient]);
}
