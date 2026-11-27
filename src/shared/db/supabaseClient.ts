import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AgendaItem, AgendaCategory, AgendaStatus, SnoozeReason, SnoozeEntry } from '@/shared/types/agenda';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface SupabaseAgendaItemRow {
  id: string;
  user_id?: string | null;
  title: string;
  description: string | null;
  start_at: number;
  end_at: number;
  reminder_minutes_before: number;
  remind_at: number;
  status: AgendaStatus;
  category: AgendaCategory;
  why_it_matters: string | null;
  voice_note_id: string | null;
  snooze_count: number;
  last_snooze_reason: SnoozeReason | null;
  snooze_history: SnoozeEntry[];
  notified_at: number | null;
  created_at?: string;
  updated_at?: string;
}

export function toSupabaseRow(item: AgendaItem): SupabaseAgendaItemRow {
  return {
    id: item.id,
    user_id: item.userId ?? null,
    title: item.title,
    description: item.description ?? null,
    start_at: item.startAt,
    end_at: item.endAt,
    reminder_minutes_before: item.reminderMinutesBefore,
    remind_at: item.remindAt,
    status: item.status,
    category: item.category,
    why_it_matters: item.whyItMatters ?? null,
    voice_note_id: item.voiceNoteId ?? null,
    snooze_count: item.snoozeCount,
    last_snooze_reason: item.lastSnoozeReason ?? null,
    snooze_history: item.snoozeHistory || [],
    notified_at: item.notifiedAt ?? null,
    updated_at: new Date(item.updatedAt).toISOString(),
  };
}

export function fromSupabaseRow(row: SupabaseAgendaItemRow): AgendaItem {
  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    title: row.title,
    description: row.description ?? undefined,
    startAt: Number(row.start_at),
    endAt: Number(row.end_at),
    reminderMinutesBefore: Number(row.reminder_minutes_before),
    remindAt: Number(row.remind_at),
    status: row.status,
    category: row.category,
    whyItMatters: row.why_it_matters ?? undefined,
    voiceNoteId: row.voice_note_id ?? undefined,
    snoozeCount: Number(row.snooze_count || 0),
    lastSnoozeReason: row.last_snooze_reason ?? undefined,
    snoozeHistory: Array.isArray(row.snooze_history) ? row.snooze_history : [],
    notifiedAt: row.notified_at ? Number(row.notified_at) : undefined,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
  };
}

export interface SupabaseVoiceNoteRow {
  id: string;
  user_id?: string | null;
  storage_path?: string | null;
  audio_base64?: string | null;
  mime_type: string;
  duration_sec: number;
  created_at?: string;
}
