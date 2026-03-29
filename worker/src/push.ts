import type { EmailReceivedEvent, Env } from './types';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

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

  const { email_id, from, subject, created_at } = event.data;
  const senderName = parseSenderName(from);

  const response = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
