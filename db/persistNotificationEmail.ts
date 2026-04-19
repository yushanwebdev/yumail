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
  const fromAddress =
    typeof data.from === 'string' ? data.from : '';
  const subject =
    typeof data.subject === 'string' ? data.subject : '(No subject)';

  insertEmails([
    {
      id: data.emailId,
      from_address: fromAddress,
      subject: subject,
      snippet: '',
      created_date: createdDate,
      created_at_ms: ms,
      is_read: 0,
    },
  ]);
}
