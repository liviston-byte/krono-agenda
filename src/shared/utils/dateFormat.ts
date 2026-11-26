import { format, isToday, isTomorrow } from 'date-fns';
import { enUS, ptBR } from 'date-fns/locale';
import type { SupportedLocale } from '@/shared/types/agenda';

function getDateLocale(locale: SupportedLocale | string) {
  return locale.startsWith('en') ? enUS : ptBR;
}

export function formatTimeRange(startAt: number, endAt: number, locale: string): string {
  const loc = getDateLocale(locale);
  const start = format(startAt, 'HH:mm', { locale: loc });
  const end = format(endAt, 'HH:mm', { locale: loc });
  return `${start} – ${end}`;
}

export function formatDayHeading(timestamp: number, locale: string): string {
  const loc = getDateLocale(locale);
  if (isToday(timestamp)) {
    return locale.startsWith('en')
      ? `Today, ${format(timestamp, 'MMM d', { locale: loc })}`
      : `Hoje, ${format(timestamp, "d 'de' MMM", { locale: loc })}`;
  }
  if (isTomorrow(timestamp)) {
    return locale.startsWith('en')
      ? `Tomorrow, ${format(timestamp, 'MMM d', { locale: loc })}`
      : `Amanhã, ${format(timestamp, "d 'de' MMM", { locale: loc })}`;
  }
  return format(timestamp, locale.startsWith('en') ? 'EEE, MMM d' : "EEE, d 'de' MMM", {
    locale: loc,
  });
}

export function formatSlotLabel(timestamp: number, locale: string): string {
  const loc = getDateLocale(locale);
  const day = isToday(timestamp)
    ? locale.startsWith('en')
      ? 'Today'
      : 'Hoje'
    : isTomorrow(timestamp)
      ? locale.startsWith('en')
        ? 'Tomorrow'
        : 'Amanhã'
      : format(timestamp, 'dd/MM', { locale: loc });
  return `${day} ${format(timestamp, 'HH:mm', { locale: loc })}`;
}
