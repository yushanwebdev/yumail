import { useEffect } from 'react';
import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getSyncMeta } from '@/db/emailQueries';
import { useNotifications } from '@/hooks/useNotifications';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function SplashGate({ synced }: { synced: boolean }) {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, [synced]);

  return null;
}

function RootLayoutInner() {
  const synced = getSyncMeta('initial_sync_complete') === 'true';

  useNotifications();

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
