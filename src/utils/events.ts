import { DEFAULT_EVENT_DURATION_MINUTES } from '@/constants';
import type { Event } from '@/types';
import { parseInstant } from './timezone';

/** Where an event stops being upcoming: its end time, or the default duration */
export function eventEndsAt(event: Pick<Event, 'date_time' | 'end_time'>): Date | null {
  const end = parseInstant(event.end_time);
  if (end) return end;

  const start = parseInstant(event.date_time);
  if (!start) return null;

  return new Date(start.getTime() + DEFAULT_EVENT_DURATION_MINUTES * 60_000);
}

/** Whether an event is still upcoming at `now`. An unparseable start counts as upcoming. */
export function isEventUpcoming(
  event: Pick<Event, 'date_time' | 'end_time'>,
  now: Date = new Date()
): boolean {
  const endsAt = eventEndsAt(event);
  return endsAt === null || endsAt.getTime() >= now.getTime();
}
