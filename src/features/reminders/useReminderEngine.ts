import { useEffect } from 'react';
import { useAppStore } from '@/app/store';
import { supabase } from '@/shared/db/supabaseClient';
import {
  playSoftChime,
  sendBrowserNotification,
} from '@/features/reminders/notificationService';

export function useReminderEngine() {
  const openReminderModal = useAppStore((s) => s.openReminderModal);

  useEffect(() => {
    const checkDueReminders = async () => {
      const now = Date.now();
      const { items, upsertItemInStore } = useAppStore.getState();
      const dueItems = items.filter(
        (item) => item.status === 'pending' && item.remindAt <= now && !item.notifiedAt,
      );

      if (dueItems.length === 0) return;

      dueItems.sort((a, b) => a.remindAt - b.remindAt);
      const first = dueItems[0];

      const updated = { ...first, notifiedAt: now };
      upsertItemInStore(updated);

      if (supabase) {
        await supabase
          .from('agenda_items')
          .update({ notified_at: now, updated_at: new Date().toISOString() })
          .eq('id', first.id);
      }

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
