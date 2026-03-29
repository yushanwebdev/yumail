import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { deltaSync } from '@/db/syncEngine';

export function useSyncOnForeground() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', async (nextState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        try {
          await deltaSync();
        } catch (e) {
          console.warn('Delta sync failed:', e);
        }
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, []);
}
