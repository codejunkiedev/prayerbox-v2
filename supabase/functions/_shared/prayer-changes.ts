import type {
  EngineAdjustmentCategory,
  EngineDailyPrayerName,
  EngineJummaName,
  ResolvedDayTimes,
} from './prayer-engine.ts';

type PrayerName = EngineDailyPrayerName | EngineJummaName;

export interface DayTimes {
  day: string;
  times: ResolvedDayTimes;
}

export interface PrayerChange {
  day: string;
  prayer: PrayerName;
  category: EngineAdjustmentCategory;
  from: string;
  to: string;
}

const PRAYER_ORDER: PrayerName[] = [
  'fajr',
  'dhuhr',
  'jumma1',
  'jumma2',
  'jumma3',
  'asr',
  'maghrib',
  'isha',
];

const PRAYER_LABELS: Record<PrayerName, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
  jumma1: "Jumu'ah",
  jumma2: "Jumu'ah 2",
  jumma3: "Jumu'ah 3",
};

const CATEGORY_LABELS: Record<EngineAdjustmentCategory, string> = {
  starts: 'start',
  athan: 'athan',
  iqamah: 'jamaat',
};

const CATEGORIES: EngineAdjustmentCategory[] = ['starts', 'athan', 'iqamah'];
const DAILY_PRAYERS: EngineDailyPrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const LISTED_IN_BODY = 2;

const prayersOf = (
  times: ResolvedDayTimes
): Map<PrayerName, Record<EngineAdjustmentCategory, string>> => {
  const map = new Map<PrayerName, Record<EngineAdjustmentCategory, string>>();
  for (const name of DAILY_PRAYERS) {
    const prayer = times.prayers?.[name];
    if (prayer) map.set(name, prayer);
  }
  for (const jumma of times.jumma ?? []) map.set(jumma.name, jumma);
  return map;
};

/** Days present on both sides only: a day with no baseline was never shown to anyone. */
export const diffPrayerDays = (before: DayTimes[], after: DayTimes[]): PrayerChange[] => {
  const beforeByDay = new Map(before.map(row => [row.day, row.times]));
  const changes: PrayerChange[] = [];

  for (const { day, times } of after) {
    const previous = beforeByDay.get(day);
    if (!previous) continue;

    const old = prayersOf(previous);
    for (const [prayer, next] of prayersOf(times)) {
      const was = old.get(prayer);
      if (!was) continue;

      for (const category of CATEGORIES) {
        if (was[category] && next[category] && was[category] !== next[category]) {
          changes.push({ day, prayer, category, from: was[category], to: next[category] });
        }
      }
    }
  }

  return changes;
};

const formatClock = (value: string): string => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return value;
  const hours = Number(match[1]);
  const suffix = hours < 12 ? 'AM' : 'PM';
  return `${hours % 12 === 0 ? 12 : hours % 12}:${match[2]} ${suffix}`;
};

const formatDay = (day: string, today: string): string => {
  if (day <= today) return 'today';

  const [year, month, date] = day.split('-').map(Number);
  const utc = new Date(Date.UTC(year, month - 1, date));
  const [ty, tm, td] = today.split('-').map(Number);
  if (utc.getTime() - Date.UTC(ty, tm - 1, td) === 86_400_000) return 'tomorrow';

  return `${WEEKDAYS[utc.getUTCDay()]} ${date} ${MONTHS[month - 1]}`;
};

export interface ChangeMessage {
  title: string;
  body: string;
}

/**
 * One notification per masjid. Each prayer and time is named once, at the
 * first day it changes, so a new jamaat time reads as one change rather than
 * fourteen.
 */
export const describeChanges = (
  masjidName: string,
  changes: PrayerChange[],
  today: string
): ChangeMessage | null => {
  const first = new Map<string, PrayerChange>();
  for (const change of [...changes].sort((a, b) => a.day.localeCompare(b.day))) {
    const key = `${change.prayer}:${change.category}`;
    if (!first.has(key)) first.set(key, change);
  }

  const summary = [...first.values()].sort(
    (a, b) =>
      PRAYER_ORDER.indexOf(a.prayer) - PRAYER_ORDER.indexOf(b.prayer) ||
      CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category)
  );
  if (summary.length === 0) return null;

  const from = formatDay(summary[0].day, today);
  const sameDay = summary.every(change => change.day === summary[0].day);
  const label = (change: PrayerChange) =>
    `${PRAYER_LABELS[change.prayer]} ${CATEGORY_LABELS[change.category]}`;

  if (summary.length === 1) {
    const [change] = summary;
    return {
      title: `${masjidName} changed a prayer time`,
      body: `${label(change)} moves to ${formatClock(change.to)} (was ${formatClock(change.from)}) from ${from}.`,
    };
  }

  const listed = summary
    .slice(0, LISTED_IN_BODY)
    .map(change => `${label(change)} ${formatClock(change.to)}`)
    .join(', ');
  const rest = summary.length - LISTED_IN_BODY;

  return {
    title: `${masjidName} changed its prayer times`,
    body: `${listed}${rest > 0 ? ` and ${rest} more` : ''}${sameDay ? ` from ${from}` : ''}. Tap to see the new times.`,
  };
};
