import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider, useInfiniteQuery } from '@tanstack/react-query';
import { fetchEmailsPage, type EmailsPage } from '@/hooks/useEmails';
import { useNotifications } from '@/hooks/useNotifications';
import { useSyncOnForeground } from '@/hooks/useSyncOnForeground';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

/**
 * On native: check SQLite sync status synchronously.
 * On web: SQLite is not available, skip sync screen.
 */
function useIsSynced(): boolean {
  if (Platform.OS === 'web') return true;
  // Dynamic require so web bundle doesn't pull in expo-sqlite
  const { getSyncMeta } = require('@/db/emailQueries') as typeof import('@/db/emailQueries');
  return getSyncMeta('initial_sync_complete') === 'true';
}

function SplashGate({ synced }: { synced: boolean }) {
  // On web (or if already synced on native), wait for first API page before hiding splash
  const needsApiFetch = Platform.OS === 'web' || !synced;

  const { isFetched: emailsFetched } = useInfiniteQuery<EmailsPage>({
    queryKey: ['emails'],
    queryFn: fetchEmailsPage,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    enabled: needsApiFetch,
  });

  useEffect(() => {
    // If synced on native, hide immediately (data is in SQLite)
    // If web or not synced, wait for first fetch (or show sync screen)
    if (!needsApiFetch || emailsFetched) {
      SplashScreen.hideAsync();
    }
  }, [needsApiFetch, emailsFetched]);

  return null;
}

function RootLayoutInner() {
  const synced = useIsSynced();

  useNotifications();
  if (Platform.OS !== 'web') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useSyncOnForeground();
  }

  return (
    <>
      <StatusBar style="dark" />
      <SplashGate synced={synced} />
      {!synced && <Redirect href="/sync" />}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="sync" options={{ gestureEnabled: false }} />
        <Stack.Screen name="index" />
        <Stack.Screen
          name="email/[id]"
          options={{
            headerShown: true,
            headerBackTitle: 'Inbox',
            headerTintColor: '#202646',
            headerShadowVisible: false,
            title: '',
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutInner />
    </QueryClientProvider>
  );
}
