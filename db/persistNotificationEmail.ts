import type * as Notifications from 'expo-notifications';
import { parseDate } from '@/api/resend';
import { insertEmails } from '@/db/emailQueries';
import { toLocalDateString } from '@/db/syncEngine';

export function persistNotificationEmail(
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
