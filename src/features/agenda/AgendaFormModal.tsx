import { useEffect, useState, type FormEvent } from 'react';
import { format } from 'date-fns';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/app/store';
import { Button, Input, Modal, Textarea } from '@/design-system';
import type { AgendaCategory } from '@/shared/types/agenda';
import { saveAgendaItem } from '@/features/agenda/agendaRepository';
import {
  VoiceRecorder,
  type RecordedVoice,
} from '@/features/reminders/VoiceRecorder';

const CATEGORIES: AgendaCategory[] = ['focus', 'personal', 'health', 'quick'];
const REMINDER_OFFSETS = [0, 5, 15, 30, 60];

export function AgendaFormModal() {
  const { t } = useTranslation();
  const isFormOpen = useAppStore((s) => s.isFormOpen);
  const editingItemId = useAppStore((s) => s.editingItemId);
  const selectedDate = useAppStore((s) => s.selectedDate);
  const closeForm = useAppStore((s) => s.closeForm);
  const editingItem = useAppStore((s) =>
    editingItemId ? s.items.find((i) => i.id === editingItemId) : undefined,
  );

  const [title, setTitle] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('09:00');
  const [durationMin, setDurationMin] = useState(30);
  const [category, setCategory] = useState<AgendaCategory>('focus');
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState(15);
  const [whyItMatters, setWhyItMatters] = useState('');
  const [recordedVoice, setRecordedVoice] = useState<RecordedVoice | null>(null);
  const [keepExistingVoiceId, setKeepExistingVoiceId] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!isFormOpen) return;

    if (editingItem) {
      setTitle(editingItem.title);
      setDateStr(format(editingItem.startAt, 'yyyy-MM-dd'));
      setTimeStr(format(editingItem.startAt, 'HH:mm'));
      setDurationMin(
        Math.max(15, Math.round((editingItem.endAt - editingItem.startAt) / 60000)),
      );
      setCategory(editingItem.category);
      setReminderMinutesBefore(editingItem.reminderMinutesBefore);
      setWhyItMatters(editingItem.whyItMatters ?? '');
      setRecordedVoice(null);
      setKeepExistingVoiceId(editingItem.voiceNoteId);
    } else {
      const base = new Date(selectedDate);
      const nextHour = Math.min(22, new Date().getHours() + 1);
      setTitle('');
      setDateStr(format(base, 'yyyy-MM-dd'));
      setTimeStr(`${String(nextHour).padStart(2, '0')}:00`);
      setDurationMin(30);
      setCategory('focus');
      setReminderMinutesBefore(15);
      setWhyItMatters('');
      setRecordedVoice(null);
      setKeepExistingVoiceId(undefined);
    }
  }, [isFormOpen, editingItem, selectedDate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dateStr || !timeStr) return;

    const [year, month, day] = dateStr.split('-').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);
    const startAt = new Date(year, month - 1, day, hour, minute, 0, 0).getTime();
    const endAt = startAt + Math.max(15, durationMin) * 60 * 1000;

    await saveAgendaItem({
      id: editingItem?.id,
      title: title.trim(),
      startAt,
      endAt,
      reminderMinutesBefore,
      category,
      whyItMatters: whyItMatters.trim() || undefined,
      voiceNote: recordedVoice,
      keepExistingVoiceNoteId: keepExistingVoiceId,
    });
    closeForm();
  };

  return (
    <Modal
      open={isFormOpen}
      onClose={closeForm}
      title={editingItem ? t('form.editTitle') : t('form.createTitle')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="agenda-title"
          label={t('form.titleLabel')}
          placeholder={t('form.titlePlaceholder')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            id="agenda-date"
            type="date"
            label={t('form.dateLabel')}
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            required
          />
          <Input
            id="agenda-time"
            type="time"
            label={t('form.startTimeLabel')}
            value={timeStr}
            onChange={(e) => setTimeStr(e.target.value)}
            required
          />
          <Input
            id="agenda-duration"
            type="number"
            min={15}
            step={15}
            label={t('form.durationLabel')}
            value={durationMin}
            onChange={(e) => setDurationMin(Number(e.target.value))}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block space-y-1.5">
            <span className="block text-xs font-medium text-[var(--text-secondary)]">
              {t('form.categoryLabel')}
            </span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AgendaCategory)}
              className="w-full h-10 px-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {t(`agenda.categories.${cat}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="block text-xs font-medium text-[var(--text-secondary)]">
              {t('form.reminderLabel')}
            </span>
            <select
              value={reminderMinutesBefore}
              onChange={(e) => setReminderMinutesBefore(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
            >
              {REMINDER_OFFSETS.map((offset) => (
                <option key={offset} value={offset}>
                  {t(`form.reminderOptions.${offset}`)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Cápsula do Eu do Passado */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-primary)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('form.capsuleTitle')}</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {t('form.capsuleHint')}
            </p>
          </div>

          <Textarea
            id="agenda-why"
            rows={2}
            label={t('form.whyLabel')}
            placeholder={t('form.whyPlaceholder')}
            value={whyItMatters}
            onChange={(e) => setWhyItMatters(e.target.value)}
          />

          <VoiceRecorder
            value={recordedVoice}
            hasExistingVoice={!!keepExistingVoiceId}
            onChange={(voice) => {
              setRecordedVoice(voice);
              if (voice) setKeepExistingVoiceId(undefined);
            }}
            onRemoveExisting={() => setKeepExistingVoiceId(undefined)}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={closeForm}>
            {t('form.cancel')}
          </Button>
          <Button type="submit" variant="primary">
            {t('form.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
