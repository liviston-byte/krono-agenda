import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, id, className = '', ...props }: InputProps) {
  return (
    <label className="block space-y-1.5" htmlFor={id}>
      {label && (
        <span className="block text-xs font-medium text-[var(--text-secondary)]">
          {label}
        </span>
      )}
      <input
        id={id}
        className={`w-full h-10 px-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors ${className}`}
        {...props}
      />
    </label>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, id, className = '', ...props }: TextareaProps) {
  return (
    <label className="block space-y-1.5" htmlFor={id}>
      {label && (
        <span className="block text-xs font-medium text-[var(--text-secondary)]">
          {label}
        </span>
      )}
      <textarea
        id={id}
        className={`w-full p-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors resize-none ${className}`}
        {...props}
      />
    </label>
  );
}
