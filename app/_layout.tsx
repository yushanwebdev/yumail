import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider, useInfiniteQuery } from '@tanstack/react-query';
import { fetchEmailsPage, type EmailsPage } from '@/hooks/useEmails';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
} from '@expo-google-fonts/playfair-display';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function SplashGate() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_400Regular_Italic,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_600SemiBold,
  });

  const { isFetched: emailsFetched } = useInfiniteQuery<EmailsPage>({
    queryKey: ['emails'],
    queryFn: fetchEmailsPage,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
  });

  const ready = fontsLoaded && emailsFetched;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

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
