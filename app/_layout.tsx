import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider, useInfiniteQuery } from '@tanstack/react-query';
import { fetchEmailsPage, type EmailsPage } from '@/hooks/useEmails';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function SplashGate() {
  const { isFetched: emailsFetched } = useInfiniteQuery<EmailsPage>({
    queryKey: ['emails'],
    queryFn: fetchEmailsPage,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
  });

  useEffect(() => {
    if (emailsFetched) {
      SplashScreen.hideAsync();
    }
  }, [emailsFetched]);

  return null;
}

function RootLayoutInner() {
  return (
    <>
      <StatusBar style="dark" />
      <SplashGate />
      <Stack screenOptions={{ headerShown: false }}>
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
