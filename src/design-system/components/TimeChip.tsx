import { Clock } from 'lucide-react';

interface TimeChipProps {
  label: string;
  urgent?: boolean;
}

export function TimeChip({ label, urgent = false }: TimeChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium font-mono-time ${
        urgent
          ? 'bg-[var(--status-urgent-soft)] text-[var(--status-urgent)]'
          : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
      }`}
    >
      <Clock className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}
