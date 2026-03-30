import type { EmailReceivedEvent, Env } from './types';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const EXPO_PUSH_TOKEN_BRACKET_RE = /^(ExponentPushToken|ExpoPushToken)\[.+\]$/;
const EXPO_PUSH_TOKEN_UUID_RE =
  /^[a-z\d]{8}-[a-z\d]{4}-[a-z\d]{4}-[a-z\d]{4}-[a-z\d]{12}$/i;

export function isExpoPushToken(token: string): boolean {
  return EXPO_PUSH_TOKEN_BRACKET_RE.test(token) || EXPO_PUSH_TOKEN_UUID_RE.test(token);
}

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

  if (!isExpoPushToken(token)) {
    console.error('Invalid Expo push token:', token);
    return;
  }

  const { email_id, from, subject, created_at } = event.data;
  const senderName = parseSenderName(from);

  const response = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.EXPO_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
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
    }),
  });

  if (!response.ok) {
    console.error('Failed to send push notification:', await response.text());
  }
}
