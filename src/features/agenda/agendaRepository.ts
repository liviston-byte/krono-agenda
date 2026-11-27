import { supabase, toSupabaseRow, type SupabaseVoiceNoteRow } from '@/shared/db/supabaseClient';
import type { AgendaCategory, AgendaItem, SnoozeReason } from '@/shared/types/agenda';
import { QUICK_SNOOZE_MINUTES } from '@/features/reminders/smartSnooze';
import { useAppStore } from '@/app/store';

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

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function getVoiceNote(id: string): Promise<SupabaseVoiceNoteRow | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('voice_notes')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as SupabaseVoiceNoteRow;
}

export async function saveAgendaItem(input: SaveAgendaInput): Promise<string> {
  const now = Date.now();
  const remindAt = input.startAt - input.reminderMinutesBefore * 60 * 1000;
  let voiceNoteId = input.keepExistingVoiceNoteId;
  const { items, upsertItemInStore, user } = useAppStore.getState();

  // Se houver nova gravação de áudio, salva na tabela voice_notes do Supabase
  if (input.voiceNote && supabase) {
    voiceNoteId = crypto.randomUUID();
    const base64Audio = await blobToBase64(input.voiceNote.blob);
    await supabase.from('voice_notes').insert({
      id: voiceNoteId,
      user_id: user?.id ?? null,
      audio_base64: base64Audio,
      mime_type: input.voiceNote.mimeType,
      duration_sec: input.voiceNote.durationSec,
    });
  }

  if (input.id) {
    const existing = items.find((i) => i.id === input.id);
    if (existing) {
      if (existing.voiceNoteId && existing.voiceNoteId !== voiceNoteId && supabase) {
        await supabase.from('voice_notes').delete().eq('id', existing.voiceNoteId);
      }
      const updated: AgendaItem = {
        ...existing,
        userId: existing.userId || user?.id,
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
      };

      upsertItemInStore(updated);
      if (supabase) {
        const { error } = await supabase
          .from('agenda_items')
          .update(toSupabaseRow(updated))
          .eq('id', input.id);
        if (error) console.error('Erro ao atualizar no Supabase:', error.message);
      }
      return input.id;
    }
  }

  const id = crypto.randomUUID();
  const newItem: AgendaItem = {
    id,
    userId: user?.id,
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

  upsertItemInStore(newItem);
  if (supabase) {
    const { error } = await supabase.from('agenda_items').insert(toSupabaseRow(newItem));
    if (error) console.error('Erro ao salvar no Supabase:', error.message);
  }

  return id;
}

export async function toggleAgendaStatus(item: AgendaItem): Promise<void> {
  const nextStatus = item.status === 'completed' ? 'pending' : 'completed';
  const updated: AgendaItem = {
    ...item,
    status: nextStatus,
    updatedAt: Date.now(),
  };

  useAppStore.getState().upsertItemInStore(updated);
  if (supabase) {
    await supabase
      .from('agenda_items')
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq('id', item.id);
  }
}

export async function deleteAgendaItem(item: AgendaItem): Promise<void> {
  useAppStore.getState().removeItemFromStore(item.id);
  if (supabase) {
    if (item.voiceNoteId) {
      await supabase.from('voice_notes').delete().eq('id', item.voiceNoteId);
    }
    await supabase.from('agenda_items').delete().eq('id', item.id);
  }
}

export async function quickSnoozeItem(item: AgendaItem): Promise<void> {
  const now = Date.now();
  const newRemindAt = now + QUICK_SNOOZE_MINUTES * 60 * 1000;
  const updated: AgendaItem = {
    ...item,
    remindAt: newRemindAt,
    snoozeCount: item.snoozeCount + 1,
    snoozeHistory: [...item.snoozeHistory, { at: now, newRemindAt }],
    notifiedAt: undefined,
    updatedAt: now,
  };

  useAppStore.getState().upsertItemInStore(updated);
  if (supabase) {
    await supabase
      .from('agenda_items')
      .update(toSupabaseRow(updated))
      .eq('id', item.id);
  }
}

export async function smartRescheduleItem(
  item: AgendaItem,
  newStartAt: number,
  newEndAt: number,
  reason: SnoozeReason,
): Promise<void> {
  const now = Date.now();
  const newRemindAt = newStartAt - item.reminderMinutesBefore * 60 * 1000;
  const updated: AgendaItem = {
    ...item,
    startAt: newStartAt,
    endAt: newEndAt,
    remindAt: newRemindAt,
    snoozeCount: item.snoozeCount + 1,
    lastSnoozeReason: reason,
    snoozeHistory: [...item.snoozeHistory, { at: now, reason, newRemindAt }],
    notifiedAt: undefined,
    updatedAt: now,
  };

  useAppStore.getState().upsertItemInStore(updated);
  if (supabase) {
    await supabase
      .from('agenda_items')
      .update(toSupabaseRow(updated))
      .eq('id', item.id);
  }
}

/**
 * Reagenda tarefas pendentes do dia para o dia seguinte (+24h).
 */
export async function movePendingToTomorrow(pendingItems: AgendaItem[]): Promise<void> {
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  for (const item of pendingItems) {
    const newStartAt = item.startAt + ONE_DAY_MS;
    const newEndAt = item.endAt + ONE_DAY_MS;
    const newRemindAt = newStartAt - item.reminderMinutesBefore * 60 * 1000;
    const updated: AgendaItem = {
      ...item,
      startAt: newStartAt,
      endAt: newEndAt,
      remindAt: newRemindAt,
      notifiedAt: undefined,
      updatedAt: Date.now(),
    };

    useAppStore.getState().upsertItemInStore(updated);
    if (supabase) {
      await supabase
        .from('agenda_items')
        .update(toSupabaseRow(updated))
        .eq('id', item.id);
    }
  }
}
