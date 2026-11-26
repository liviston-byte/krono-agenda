import type { ReactNode } from 'react';

type BadgeTone = 'neutral' | 'accent' | 'calm' | 'soon' | 'urgent';

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]',
  accent: 'bg-[var(--accent-soft)] text-[var(--accent-primary)]',
  calm: 'bg-[var(--status-calm-soft)] text-[var(--status-calm)]',
  soon: 'bg-[var(--status-soon-soft)] text-[var(--status-soon)]',
  urgent: 'bg-[var(--status-urgent-soft)] text-[var(--status-urgent)]',
};

export function Badge({ tone = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
