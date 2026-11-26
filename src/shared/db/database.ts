import Dexie, { type EntityTable } from 'dexie';
import type { AgendaItem, VoiceNote } from '@/shared/types/agenda';

class KronoDatabase extends Dexie {
  items!: EntityTable<AgendaItem, 'id'>;
  voiceNotes!: EntityTable<VoiceNote, 'id'>;

  constructor() {
    super('krono-local-db');
    this.version(1).stores({
      items: 'id, startAt, remindAt, status, category',
      voiceNotes: 'id, createdAt',
    });
  }
}

export const db = new KronoDatabase();
