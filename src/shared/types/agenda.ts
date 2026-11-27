export type AgendaCategory = 'focus' | 'personal' | 'health' | 'quick';

export type AgendaStatus = 'pending' | 'completed';

export type SnoozeReason = 'no_time' | 'low_energy' | 'blocked';

export interface SnoozeEntry {
  at: number;
  reason?: SnoozeReason;
  newRemindAt: number;
}

export interface AgendaItem {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  startAt: number;
  endAt: number;
  reminderMinutesBefore: number;
  remindAt: number;
  status: AgendaStatus;
  category: AgendaCategory;
  /** Ideia 1: Cápsula do Eu do Passado */
  whyItMatters?: string;
  voiceNoteId?: string;
  /** Ideia 2: Soneca com Fricção Inteligente */
  snoozeCount: number;
  lastSnoozeReason?: SnoozeReason;
  snoozeHistory: SnoozeEntry[];
  notifiedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface VoiceNote {
  id: string;
  blob: Blob;
  mimeType: string;
  durationSec: number;
  createdAt: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type SupportedLocale = 'pt-BR' | 'en-US';
export type ViewMode = 'day' | 'week';
