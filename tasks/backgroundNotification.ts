import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { persistNotificationEmail } from '@/db/persistNotificationEmail';

export const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND_NOTIFICATION_TASK';

type BackgroundNotificationData = {
  notification?: Notifications.Notification;
};

TaskManager.defineTask<BackgroundNotificationData>(
  BACKGROUND_NOTIFICATION_TASK,
  async ({ data, error }) => {
    if (error) {
      console.warn('Background notification task error:', error);
      return;
    }
    persistNotificationEmail(data?.notification?.request.content.data);
  },
);
