import { addDays, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';
import type { AgendaItem, SnoozeReason } from '@/shared/types/agenda';

export const QUICK_SNOOZE_MINUTES = 15;
export const FRICTION_THRESHOLD = 2; // On 3rd snooze (snoozeCount >= 2), friction is required

export function requiresSnoozeFriction(snoozeCount: number): boolean {
  return snoozeCount >= FRICTION_THRESHOLD;
}

function roundUpTo15Min(ts: number): number {
  const step = 15 * 60 * 1000;
  return Math.ceil(ts / step) * step;
}

function getSearchStart(now: number, reason: SnoozeReason): number {
  if (reason === 'blocked') {
    const tomorrow = addDays(now, 1);
    return setMilliseconds(setSeconds(setMinutes(setHours(tomorrow, 9), 0), 0), 0).getTime();
  }
  if (reason === 'low_energy') {
    return roundUpTo15Min(now + 2 * 60 * 60 * 1000);
  }
  // 'no_time'
  return roundUpTo15Min(now + 60 * 60 * 1000);
}

/**
 * Finds the next free time slot of `durationMs` that does not overlap
 * with any pending agenda item, keeping within 08:00–21:00 when possible.
 */
export function findNextFreeSlot(
  existingItems: AgendaItem[],
  durationMs: number,
  now: number,
  reason: SnoozeReason,
  excludeItemId?: string,
): { startAt: number; endAt: number } {
  const safeDuration = Math.max(durationMs, 15 * 60 * 1000);
  let candidateStart = getSearchStart(now, reason);

  const busy = existingItems
    .filter((item) => item.status === 'pending' && item.id !== excludeItemId)
    .map((item) => ({ start: item.startAt, end: item.endAt }))
    .sort((a, b) => a.start - b.start);

  // Guard against infinite loops: max 60 iterations
  for (let i = 0; i < 60; i++) {
    const hour = new Date(candidateStart).getHours();
    if (hour >= 21) {
      const nextDay = addDays(candidateStart, 1);
      candidateStart = setMilliseconds(setSeconds(setMinutes(setHours(nextDay, 8), 0), 0), 0).getTime();
      continue;
    }
    if (hour < 8) {
      candidateStart = setMilliseconds(setSeconds(setMinutes(setHours(candidateStart, 8), 0), 0), 0).getTime();
    }

    const candidateEnd = candidateStart + safeDuration;
    const conflict = busy.find(
      (slot) => candidateStart < slot.end && candidateEnd > slot.start,
    );

    if (!conflict) {
      return { startAt: candidateStart, endAt: candidateEnd };
    }

    candidateStart = roundUpTo15Min(conflict.end);
  }

  return { startAt: candidateStart, endAt: candidateStart + safeDuration };
}
