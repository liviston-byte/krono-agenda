import { db } from '@/shared/db/database';
import type { AgendaCategory, AgendaItem, SnoozeReason, VoiceNote } from '@/shared/types/agenda';
import { QUICK_SNOOZE_MINUTES } from '@/features/reminders/smartSnooze';

export interface SaveAgendaInput {
  id?: string;
  title: string;
  description?: string;
  startAt: number;
  endAt: number;
  reminderMinutesBefore: number;
  category: AgendaCategory;
  whyItMatters?: string;
  voiceNote?: { blob: Blob; mimeType: string; durationSec: number } | null;
  keepExistingVoiceNoteId?: string;
}

export async function saveAgendaItem(input: SaveAgendaInput): Promise<string> {
  const now = Date.now();
  const remindAt = input.startAt - input.reminderMinutesBefore * 60 * 1000;
  let voiceNoteId = input.keepExistingVoiceNoteId;

  if (input.voiceNote) {
    voiceNoteId = crypto.randomUUID();
    const note: VoiceNote = {
      id: voiceNoteId,
      blob: input.voiceNote.blob,
      mimeType: input.voiceNote.mimeType,
      durationSec: input.voiceNote.durationSec,
      createdAt: now,
    };
    await db.voiceNotes.put(note);
  }

  if (input.id) {
    const existing = await db.items.get(input.id);
    if (existing) {
      if (existing.voiceNoteId && existing.voiceNoteId !== voiceNoteId) {
        await db.voiceNotes.delete(existing.voiceNoteId);
      }
      await db.items.update(input.id, {
        title: input.title,
        description: input.description,
        startAt: input.startAt,
        endAt: input.endAt,
        reminderMinutesBefore: input.reminderMinutesBefore,
        remindAt,
        category: input.category,
        whyItMatters: input.whyItMatters,
        voiceNoteId,
        notifiedAt: undefined,
        updatedAt: now,
      });
      return input.id;
    }
  }

  const id = crypto.randomUUID();
  const newItem: AgendaItem = {
    id,
    title: input.title,
    description: input.description,
    startAt: input.startAt,
    endAt: input.endAt,
    reminderMinutesBefore: input.reminderMinutesBefore,
    remindAt,
    status: 'pending',
    category: input.category,
    whyItMatters: input.whyItMatters,
    voiceNoteId,
    snoozeCount: 0,
    snoozeHistory: [],
    createdAt: now,
    updatedAt: now,
  };
  await db.items.put(newItem);
  return id;
}

export async function toggleAgendaStatus(item: AgendaItem): Promise<void> {
  const nextStatus = item.status === 'completed' ? 'pending' : 'completed';
  await db.items.update(item.id, {
    status: nextStatus,
    updatedAt: Date.now(),
  });
}

export async function deleteAgendaItem(item: AgendaItem): Promise<void> {
  if (item.voiceNoteId) {
    await db.voiceNotes.delete(item.voiceNoteId);
  }
  await db.items.delete(item.id);
}

export async function quickSnoozeItem(item: AgendaItem): Promise<void> {
  const now = Date.now();
  const newRemindAt = now + QUICK_SNOOZE_MINUTES * 60 * 1000;
  await db.items.update(item.id, {
    remindAt: newRemindAt,
    snoozeCount: item.snoozeCount + 1,
    snoozeHistory: [...item.snoozeHistory, { at: now, newRemindAt }],
    notifiedAt: undefined,
    updatedAt: now,
  });
}

export async function smartRescheduleItem(
  item: AgendaItem,
  newStartAt: number,
  newEndAt: number,
  reason: SnoozeReason,
): Promise<void> {
  const now = Date.now();
  const newRemindAt = newStartAt - item.reminderMinutesBefore * 60 * 1000;
  await db.items.update(item.id, {
    startAt: newStartAt,
    endAt: newEndAt,
    remindAt: newRemindAt,
    snoozeCount: item.snoozeCount + 1,
    lastSnoozeReason: reason,
    snoozeHistory: [...item.snoozeHistory, { at: now, reason, newRemindAt }],
    notifiedAt: undefined,
    updatedAt: now,
  });
}
