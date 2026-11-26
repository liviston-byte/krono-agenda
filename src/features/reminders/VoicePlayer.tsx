import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Volume2 } from 'lucide-react';
import { db } from '@/shared/db/database';

interface VoicePlayerProps {
  voiceNoteId: string;
  label: string;
}

export function VoicePlayer({ voiceNoteId, label }: VoicePlayerProps) {
  const voiceNote = useLiveQuery(() => db.voiceNotes.get(voiceNoteId), [voiceNoteId]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!voiceNote?.blob) return;
    const url = URL.createObjectURL(voiceNote.blob);
    setAudioUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [voiceNote]);

  if (!audioUrl) return null;

  return (
    <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
        <Volume2 className="w-4 h-4 text-[var(--accent-primary)]" />
        <span>{label}</span>
      </div>
      <audio controls src={audioUrl} className="w-full h-9" />
    </div>
  );
}
