import { useEffect, useRef, useState } from 'react';
import { Mic, Square, Trash2, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/design-system';

export interface RecordedVoice {
  blob: Blob;
  mimeType: string;
  durationSec: number;
}

interface VoiceRecorderProps {
  value: RecordedVoice | null;
  hasExistingVoice?: boolean;
  onChange: (voice: RecordedVoice | null) => void;
  onRemoveExisting?: () => void;
}

const MAX_SECONDS = 10;

export function VoiceRecorder({
  value,
  hasExistingVoice = false,
  onChange,
  onRemoveExisting,
}: VoiceRecorderProps) {
  const { t } = useTranslation();
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const secondsRef = useRef(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      secondsRef.current = 0;
      setSeconds(0);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        if (timerRef.current) window.clearInterval(timerRef.current);
        const mimeType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        onChange({
          blob,
          mimeType,
          durationSec: Math.max(1, secondsRef.current),
        });
        setRecording(false);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);

      timerRef.current = window.setInterval(() => {
        secondsRef.current += 1;
        setSeconds(secondsRef.current);
        if (secondsRef.current >= MAX_SECONDS) {
          recorder.stop();
        }
      }, 1000);
    } catch {
      setError(t('form.micError'));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  if (value) {
    return (
      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[var(--accent-soft)] text-[var(--accent-primary)] text-xs font-medium">
        <span className="inline-flex items-center gap-1.5">
          <Volume2 className="w-4 h-4" />
          {t('form.voiceSaved', { sec: value.durationSec })}
        </span>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="inline-flex items-center gap-1 text-[var(--status-urgent)] hover:underline cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          {t('form.removeVoice')}
        </button>
      </div>
    );
  }

  if (hasExistingVoice) {
    return (
      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[var(--accent-soft)] text-[var(--accent-primary)] text-xs font-medium">
        <span className="inline-flex items-center gap-1.5">
          <Volume2 className="w-4 h-4" />
          {t('reminderModal.voiceLabel')}
        </span>
        {onRemoveExisting && (
          <button
            type="button"
            onClick={onRemoveExisting}
            className="inline-flex items-center gap-1 text-[var(--status-urgent)] hover:underline cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t('form.removeVoice')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {recording ? (
        <Button type="button" variant="danger" size="sm" onClick={stopRecording}>
          <Square className="w-3.5 h-3.5 fill-current" />
          {t('form.stopRecording', { sec: seconds })}
        </Button>
      ) : (
        <Button type="button" variant="secondary" size="sm" onClick={startRecording}>
          <Mic className="w-3.5 h-3.5" />
          {t('form.recordVoice')}
        </Button>
      )}
      {error && <p className="text-xs text-[var(--status-urgent)]">{error}</p>}
    </div>
  );
}
