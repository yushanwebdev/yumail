import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { usePushTokenStore } from '@/stores/usePushTokenStore';
import { insertEmails } from '@/db/emailQueries';
import { parseDate } from '@/api/resend';
import { toLocalDateString } from '@/db/syncEngine';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('Push notifications require a physical device');
    return null;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Push notification permission not granted');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('emails', {
      name: 'New Emails',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2952A3',
    });
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    console.warn('Missing EAS projectId — run `npx eas init` to configure');
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
  const token = tokenData.data;

  // Register push token with the Cloudflare Worker
  const workerUrl = process.env.EXPO_PUBLIC_WORKER_URL;
  const workerApiKey = Constants.expoConfig?.extra?.workerApiKey;
  if (workerUrl) {
    try {
      const response = await fetch(`${workerUrl}/api/push-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(workerApiKey && { Authorization: `Bearer ${workerApiKey}` }),
        },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) {
        const body = await response.text().catch(() => '');
        console.warn(
          `Failed to register push token with server: ${response.status} ${response.statusText}${body ? ` — ${body}` : ''}`,
        );
      }
    } catch (err) {
      console.warn('Failed to register push token with server:', err);
    }
  }

  return token;
}

function persistNotificationEmail(
  data: Notifications.NotificationRequest['content']['data'],
) {
  if (!data?.emailId || typeof data.emailId !== 'string') return;
  const parsed = data.createdAt ? parseDate(data.createdAt as string) : null;
  const ms = parsed ? parsed.getTime() : Date.now();
  const createdDate = parsed ? toLocalDateString(parsed) : toLocalDateString(new Date());
  insertEmails([
    {
      id: data.emailId,
      from_address: (data.from as string) || '',
      subject: (data.subject as string) || '(No subject)',
      snippet: '',
      created_date: createdDate,
      created_at_ms: ms,
      is_read: 0,
    },
  ]);
}

function handleNotificationResponse(response: Notifications.NotificationResponse) {
  const data = response.notification.request.content.data;
  persistNotificationEmail(data);
  if (data?.emailId && typeof data.emailId === 'string') {
    const safeId = encodeURIComponent(data.emailId);
    router.push(`/email/${safeId}`);
  }
}

export function useNotifications() {
  const setExpoPushToken = usePushTokenStore((s) => s.setExpoPushToken);
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    registerForPushNotifications()
      .then((token) => {
        if (token) {
          setExpoPushToken(token);
        }
      })
      .catch((error) => {
        console.error('Failed to register for push notifications:', error);
      });

    // Handle notification tap that launched the app (cold start)
    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse) {
      handleNotificationResponse(lastResponse);
    }

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      persistNotificationEmail(notification.request.content.data);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse,
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [setExpoPushToken]);
}
