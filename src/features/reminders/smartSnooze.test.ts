import { describe, expect, it } from 'vitest';
import {
  findNextFreeSlot,
  requiresSnoozeFriction,
} from '@/features/reminders/smartSnooze';
import type { AgendaItem } from '@/shared/types/agenda';

function makeItem(
  id: string,
  startAt: number,
  endAt: number,
  status: 'pending' | 'completed' = 'pending',
): AgendaItem {
  return {
    id,
    title: `Task ${id}`,
    startAt,
    endAt,
    reminderMinutesBefore: 10,
    remindAt: startAt - 10 * 60 * 1000,
    status,
    category: 'focus',
    snoozeCount: 0,
    snoozeHistory: [],
    createdAt: startAt,
    updatedAt: startAt,
  };
}

describe('smartSnooze', () => {
  it('requires friction starting on the 3rd snooze (snoozeCount >= 2)', () => {
    expect(requiresSnoozeFriction(0)).toBe(false);
    expect(requiresSnoozeFriction(1)).toBe(false);
    expect(requiresSnoozeFriction(2)).toBe(true);
    expect(requiresSnoozeFriction(4)).toBe(true);
  });

  it('skips busy slots when finding next free slot for no_time', () => {
    const base = new Date(2026, 10, 25, 10, 0, 0, 0).getTime();
    const busyStart = new Date(2026, 10, 25, 11, 0, 0, 0).getTime();
    const busyEnd = new Date(2026, 10, 25, 12, 0, 0, 0).getTime();

    const items = [makeItem('1', busyStart, busyEnd)];
    const slot = findNextFreeSlot(items, 30 * 60 * 1000, base, 'no_time');

    expect(slot.startAt).toBe(busyEnd);
    expect(slot.endAt).toBe(busyEnd + 30 * 60 * 1000);
  });

  it('schedules blocked tasks to next day 09:00 or later', () => {
    const base = new Date(2026, 10, 25, 10, 0, 0, 0).getTime();
    const expectedStart = new Date(2026, 10, 26, 9, 0, 0, 0).getTime();

    const slot = findNextFreeSlot([], 30 * 60 * 1000, base, 'blocked');
    expect(slot.startAt).toBe(expectedStart);
  });
});
