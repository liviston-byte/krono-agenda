import { useEffect } from 'react';
import { db } from '@/shared/db/database';
import { useAppStore } from '@/app/store';
import {
  playSoftChime,
  sendBrowserNotification,
} from '@/features/reminders/notificationService';

export function useReminderEngine() {
  const openReminderModal = useAppStore((s) => s.openReminderModal);

  useEffect(() => {
    const checkDueReminders = async () => {
      const now = Date.now();
      const dueItems = await db.items
        .where('status')
        .equals('pending')
        .filter((item) => item.remindAt <= now && !item.notifiedAt)
        .toArray();

      if (dueItems.length === 0) return;

      // Sort by earliest remindAt
      dueItems.sort((a, b) => a.remindAt - b.remindAt);
      const first = dueItems[0];

      await db.items.update(first.id, { notifiedAt: now });
      playSoftChime();
      await sendBrowserNotification(
        first.title,
        first.whyItMatters || first.description || '',
        first.id,
      );
      openReminderModal(first.id);
    };

    checkDueReminders();
    const intervalId = window.setInterval(checkDueReminders, 10_000);

    const handleSwMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NOTIFICATION_CLICKED' && event.data?.itemId) {
        openReminderModal(event.data.itemId);
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
    }

    return () => {
      window.clearInterval(intervalId);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      }
    };
  }, [openReminderModal]);
}
