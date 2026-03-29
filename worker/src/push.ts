import Expo from 'expo-server-sdk';
import type { EmailReceivedEvent, Env } from './types';

function parseSenderName(from: string): string {
  const match = from.match(/^(.+?)\s*<.+>$/);
  return match ? match[1].trim() : from.split('@')[0];
}

export async function sendPushNotification(
  env: Env,
  event: EmailReceivedEvent,
): Promise<void> {
  const token = await env.PUSH_TOKENS.get('latest');
  if (!token) {
    console.log('No push token registered, skipping notification');
    return;
  }

  if (!Expo.isExpoPushToken(token)) {
    console.error('Invalid Expo push token:', token);
    return;
  }

  const expo = new Expo({ accessToken: env.EXPO_ACCESS_TOKEN });
  const { email_id, from, subject, created_at } = event.data;
  const senderName = parseSenderName(from);

  const tickets = await expo.sendPushNotificationsAsync([
    {
      to: token,
      title: senderName,
      body: subject || '(No subject)',
      data: {
        emailId: email_id,
        from,
        subject: subject || '(No subject)',
        createdAt: created_at,
      },
      sound: 'default',
      channelId: 'emails',
    },
  ]);

  const ticket = tickets[0];
  if (ticket.status === 'error') {
    console.error('Push notification error:', ticket.message, ticket.details);
  }
}
