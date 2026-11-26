import { useEffect, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { BellRing, Check, Clock, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { db } from '@/shared/db/database';
import { useAppStore } from '@/app/store';
import { Badge, Button, Modal } from '@/design-system';
import type { SnoozeReason } from '@/shared/types/agenda';
import {
  findNextFreeSlot,
  requiresSnoozeFriction,
} from '@/features/reminders/smartSnooze';
import {
  quickSnoozeItem,
  smartRescheduleItem,
  toggleAgendaStatus,
} from '@/features/agenda/agendaRepository';
import { VoicePlayer } from '@/features/reminders/VoicePlayer';
import { formatSlotLabel, formatTimeRange } from '@/shared/utils/dateFormat';

const REASONS: SnoozeReason[] = ['no_time', 'low_energy', 'blocked'];

export function ActiveReminderModal() {
  const { t, i18n } = useTranslation();
  const activeReminderId = useAppStore((s) => s.activeReminderId);
  const openReminderModal = useAppStore((s) => s.openReminderModal);

  const item = useLiveQuery(
    () => (activeReminderId ? db.items.get(activeReminderId) : undefined),
    [activeReminderId],
  );
  const allItems = useLiveQuery(() => db.items.toArray(), []) ?? [];

  const [selectedReason, setSelectedReason] = useState<SnoozeReason>('no_time');

  useEffect(() => {
    setSelectedReason('no_time');
  }, [activeReminderId]);

  const needsFriction = item ? requiresSnoozeFriction(item.snoozeCount) : false;

  const suggestedSlot = useMemo(() => {
    if (!item || !needsFriction) return null;
    const duration = item.endAt - item.startAt;
    return findNextFreeSlot(allItems, duration, Date.now(), selectedReason, item.id);
  }, [item, needsFriction, allItems, selectedReason]);

  if (!item) return null;

  const handleClose = () => openReminderModal(null);

  const handleDone = async () => {
    if (item.status !== 'completed') {
      await toggleAgendaStatus(item);
    }
    handleClose();
  };

  const handleQuickSnooze = async () => {
    await quickSnoozeItem(item);
    handleClose();
  };

  const handleSmartReschedule = async () => {
    if (!suggestedSlot) return;
    await smartRescheduleItem(
      item,
      suggestedSlot.startAt,
      suggestedSlot.endAt,
      selectedReason,
    );
    handleClose();
  };

  return (
    <Modal open={!!activeReminderId} onClose={handleClose} title={item.title}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="urgent">
            <BellRing className="w-3.5 h-3.5" />
            {t('reminderModal.badge')}
          </Badge>
          <span className="text-xs font-mono-time text-[var(--text-muted)]">
            {formatTimeRange(item.startAt, item.endAt, i18n.language)}
          </span>
        </div>

        {/* Ideia 1: Cápsula do Eu do Passado */}
        {(item.whyItMatters || item.voiceNoteId) && (
          <div className="p-4 rounded-2xl bg-[var(--accent-soft)] border border-[var(--accent-primary)]/20 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-primary)]">
              <Sparkles className="w-4 h-4" />
              <span>{t('reminderModal.capsuleLabel')}</span>
            </div>
            {item.whyItMatters && (
              <p className="font-serif-editorial italic text-base text-[var(--text-primary)] leading-relaxed">
                “{item.whyItMatters}”
              </p>
            )}
            {item.voiceNoteId && (
              <VoicePlayer
                voiceNoteId={item.voiceNoteId}
                label={t('reminderModal.voiceLabel')}
              />
            )}
          </div>
        )}

        {/* Ideia 2: Soneca com Fricção Inteligente */}
        {needsFriction ? (
          <div className="p-4 rounded-2xl bg-[var(--status-soon-soft)] border border-[var(--status-soon)]/30 space-y-3">
            <div>
              <p className="text-sm font-semibold text-[var(--status-soon)]">
                {t('reminderModal.frictionTitle', { count: item.snoozeCount })}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {t('reminderModal.frictionSubtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {REASONS.map((reason) => {
                const active = selectedReason === reason;
                return (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setSelectedReason(reason)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-colors cursor-pointer ${
                      active
                        ? 'bg-[var(--bg-surface)] border-[var(--status-soon)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]'
                        : 'bg-transparent border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]/60'
                    }`}
                  >
                    {t(`reminderModal.reasons.${reason}`)}
                  </button>
                );
              })}
            </div>

            {suggestedSlot && (
              <p className="text-xs font-medium text-[var(--text-primary)]">
                {t('reminderModal.suggestedSlot', {
                  slot: formatSlotLabel(suggestedSlot.startAt, i18n.language),
                })}
              </p>
            )}
          </div>
        ) : null}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          {needsFriction ? (
            <Button type="button" variant="secondary" onClick={handleSmartReschedule}>
              <Clock className="w-4 h-4" />
              {t('reminderModal.confirmSmartSnooze')}
            </Button>
          ) : (
            <Button type="button" variant="secondary" onClick={handleQuickSnooze}>
              <Clock className="w-4 h-4" />
              {t('reminderModal.snoozeBtn')}
            </Button>
          )}
          <Button type="button" variant="primary" onClick={handleDone}>
            <Check className="w-4 h-4" />
            {t('reminderModal.doneBtn')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
