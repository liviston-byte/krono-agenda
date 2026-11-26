import { Bell, Check, Edit2, Mic, RotateCcw, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Badge, Button } from '@/design-system';
import type { AgendaCategory, AgendaItem } from '@/shared/types/agenda';
import {
  deleteAgendaItem,
  toggleAgendaStatus,
} from '@/features/agenda/agendaRepository';
import { useAppStore } from '@/app/store';

interface AgendaCardProps {
  item: AgendaItem;
}

const categoryTone: Record<AgendaCategory, 'accent' | 'neutral' | 'calm' | 'soon'> = {
  focus: 'accent',
  personal: 'neutral',
  health: 'calm',
  quick: 'soon',
};

export function AgendaCard({ item }: AgendaCardProps) {
  const { t } = useTranslation();
  const openEditForm = useAppStore((s) => s.openEditForm);
  const openReminderModal = useAppStore((s) => s.openReminderModal);

  const isCompleted = item.status === 'completed';
  const startLabel = format(item.startAt, 'HH:mm');
  const endLabel = format(item.endAt, 'HH:mm');

  return (
    <article
      className={`group relative grid grid-cols-[72px_1fr] sm:grid-cols-[88px_1fr] gap-4 py-4 border-b border-[var(--border-subtle)] last:border-b-0 transition-opacity ${
        isCompleted ? 'opacity-55' : ''
      }`}
    >
      {/* Left time rail */}
      <div className="pt-0.5 text-right pr-3 border-r border-[var(--border-subtle)]">
        <div
          className={`text-sm font-medium font-mono-time ${
            !isCompleted && item.snoozeCount >= 2
              ? 'text-[var(--status-urgent)]'
              : 'text-[var(--text-primary)]'
          }`}
        >
          {startLabel}
        </div>
        <div className="text-xs font-mono-time text-[var(--text-muted)]">
          {endLabel}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 min-w-0">
        <div className="space-y-2 min-w-0 max-w-[65ch]">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`text-base font-semibold tracking-tight text-[var(--text-primary)] ${
                isCompleted ? 'line-through' : ''
              }`}
            >
              {item.title}
            </h3>
            <Badge tone={categoryTone[item.category]}>
              {t(`agenda.categories.${item.category}`)}
            </Badge>
            {item.snoozeCount > 0 && !isCompleted && (
              <Badge tone={item.snoozeCount >= 2 ? 'urgent' : 'soon'}>
                {t('agenda.snoozedCount', { count: item.snoozeCount })}
              </Badge>
            )}
            {item.voiceNoteId && (
              <Badge tone="accent">
                <Mic className="w-3 h-3" />
              </Badge>
            )}
          </div>

          {item.whyItMatters && (
            <blockquote className="pl-3 border-l-2 border-[var(--accent-primary)]/50 font-serif-editorial italic text-[15px] leading-snug text-[var(--text-secondary)]">
              “{item.whyItMatters}”
            </blockquote>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 sm:opacity-75 sm:group-hover:opacity-100 transition-opacity">
          {!isCompleted && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              title={t('agenda.testReminder')}
              onClick={() => openReminderModal(item.id)}
            >
              <Bell className="w-4 h-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            title={isCompleted ? t('agenda.reopen') : t('agenda.markDone')}
            onClick={() => toggleAgendaStatus(item)}
          >
            {isCompleted ? (
              <RotateCcw className="w-4 h-4" />
            ) : (
              <Check className="w-4 h-4 text-[var(--status-calm)]" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            title={t('agenda.edit')}
            onClick={() => openEditForm(item.id)}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            title={t('agenda.delete')}
            onClick={() => deleteAgendaItem(item)}
          >
            <Trash2 className="w-4 h-4 text-[var(--status-urgent)]" />
          </Button>
        </div>
      </div>
    </article>
  );
}
