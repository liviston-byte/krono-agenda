import { useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { getVoiceNote } from '@/features/agenda/agendaRepository';

interface VoicePlayerProps {
  voiceNoteId: string;
  label: string;
}

export function VoicePlayer({ voiceNoteId, label }: VoicePlayerProps) {
  const [audioSrc, setAudioSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void getVoiceNote(voiceNoteId).then((note) => {
      if (!active) return;
      if (note?.audio_base64) {
        setAudioSrc(note.audio_base64);
      }
    });
    return () => {
      active = false;
    };
  }, [voiceNoteId]);

  if (!audioSrc) return null;

  return (
    <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
        <Volume2 className="w-4 h-4 text-[var(--accent-primary)]" />
        <span>{label}</span>
      </div>
      <audio controls src={audioSrc} className="w-full h-9" />
    </div>
  );
}
