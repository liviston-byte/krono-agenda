import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  elevated?: boolean;
}

export function Card({ children, elevated = false, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-[var(--border-subtle)] ${
        elevated ? 'bg-[var(--bg-elevated)] shadow-[var(--shadow-md)]' : 'bg-[var(--bg-surface)] shadow-[var(--shadow-sm)]'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
