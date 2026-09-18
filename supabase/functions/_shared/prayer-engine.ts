// GENERATED FILE — do not edit.
// Copied from src/utils/prayer-engine.ts by supabase/scripts/sync-prayer-engine.mjs.
// Edit the original and run `npm run sync:engine`.

/**
 * The adjustment math behind every prayer time this project shows, in one file.
 *
 * Dependency-free on purpose: `npm run sync:engine` copies it verbatim to
 * `supabase/functions/_shared/prayer-engine.ts`, where it runs under Deno with
 * no bundler, no `@/` aliases and no date-fns, so the console, the displays and
 * the mobile directory all resolve a masjid's times the same way.
 * `npm run check:engine` fails CI when that copy is stale.
 *
 * Everything here speaks 24-hour `HH:mm`. Display formatting stays with the
 * caller — see `formatTime` in `date-time.ts`.
 */

export type EngineAdjustmentType = 'offset' | 'manual' | 'default';

export interface EngineSingleAdjustment {
  type: EngineAdjustmentType;
  offset?: number;
  manual_time?: string;
}

export type EngineAdjustmentCategory = 'starts' | 'athan' | 'iqamah';

export interface EnginePrayerAdjustment {
  starts: EngineSingleAdjustment;
  athan: EngineSingleAdjustment;
  iqamah: EngineSingleAdjustment;
}

export type EngineDailyPrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
export type EngineJummaName = 'jumma1' | 'jumma2' | 'jumma3';
export type EnginePrayerName = EngineDailyPrayerName | EngineJummaName;

export type EnginePrayerAdjustments = Partial<Record<EnginePrayerName, EnginePrayerAdjustment>>;

export interface EngineSolarAdjustments {
  sunrise?: EngineSingleAdjustment | null;
  ishraq?: EngineSingleAdjustment | null;
  chasht?: EngineSingleAdjustment | null;
  sunset?: EngineSingleAdjustment | null;
}

export const ENGINE_DAILY_PRAYERS: readonly EngineDailyPrayerName[] = [
  'fajr',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
];

export const ENGINE_JUMMA_VARIANTS: readonly EngineJummaName[] = ['jumma1', 'jumma2', 'jumma3'];

export const ENGINE_CATEGORIES: readonly EngineAdjustmentCategory[] = ['starts', 'athan', 'iqamah'];

const MINUTES_PER_DAY = 1440;

/** Strict 24-hour clock, the only shape this engine stores or returns. */
const CLOCK_PATTERN = /^(\d{1,2}):(\d{2})$/;

/** Matches `hh:mm a` and `HH:mm`, e.g. "03:48 PM" or "15:48". */
const WALL_CLOCK_PATTERN = /^(\d{1,2}):(\d{2})(?:\s*([ap]m))?$/i;

/** AlAdhan returns times as `05:16 (PKT)`; everything downstream wants `05:16`. */
export const clockPart = (time: string): string => (time.includes(' ') ? time.split(' ')[0] : time);

const toMinutes = (time: string): number | null => {
  const match = CLOCK_PATTERN.exec(time);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;

  return hours * 60 + minutes;
};

const fromMinutes = (total: number): string => {
  const wrapped = ((total % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(wrapped / 60);
  const minutes = wrapped % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

/**
 * Splits a wall-clock time string into hours and minutes.
 *
 * Parsed explicitly rather than through `new Date('<date> <time>')`, which is
 * implementation-defined, and keeps midnight exact — 12:00 AM and 12:00 PM are
 * the two cases a naive `% 12` gets wrong.
 */
export const parseWallClock = (value: string): { hours: number; minutes: number } | null => {
  const match = WALL_CLOCK_PATTERN.exec(value.trim());
  if (!match) return null;

  const [, rawHours, rawMinutes, meridiem] = match;
  let hours = Number(rawHours);
  const minutes = Number(rawMinutes);
  if (minutes > 59) return null;

  if (meridiem) {
    if (hours < 1 || hours > 12) return null;
    hours = hours % 12;
    if (meridiem.toLowerCase() === 'pm') hours += 12;
  } else if (hours > 23) {
    return null;
  }

  return { hours, minutes };
};

/** Shifts a `HH:mm` time, wrapping across midnight. Unparseable input passes through. */
export const addClockMinutes = (time: string, minutes: number): string => {
  const base = toMinutes(time);
  if (base === null || !Number.isFinite(minutes)) return time;
  return fromMinutes(base + Math.trunc(minutes));
};

/** Whole minutes from one `HH:mm` to another on the same day; negative when `to` is earlier. */
export const clockDifference = (from: string, to: string): number => {
  const start = toMinutes(from);
  const end = toMinutes(to);
  if (start === null || end === null) return 0;
  return end - start;
};

/**
 * Applies one adjustment and returns the result still in `HH:mm`, for callers
 * that go on to do arithmetic with it (see the Ishraq/Chasht bases).
 *
 * A `manual` with no time set, or an `offset` with no offset, falls through to
 * the base time.
 */
export const applyAdjustment = (
  time: string,
  adjustment: EngineSingleAdjustment | undefined | null
): string => {
  const timeOnly = clockPart(time);
  if (!adjustment) return timeOnly;

  if (adjustment.type === 'offset' && adjustment.offset !== undefined) {
    return addClockMinutes(timeOnly, adjustment.offset);
  }
  if (adjustment.type === 'manual' && adjustment.manual_time) {
    return adjustment.manual_time;
  }
  return timeOnly;
};

/**
 * Minutes after sunrise at which Ishraq becomes due. The sun has to clear the
 * horizon by "the length of a spear" before the forbidden time at sunrise ends,
 * which the fatwa literature and printed timetables settle at 15–20 minutes;
 * 15 is the figure most of them print, and the offset control covers a masjid
 * that prefers 20.
 */
export const ISHRAQ_MINUTES_AFTER_SUNRISE = 15;

/**
 * Ishraq, as `HH:mm` before its own adjustment. Derived rather than fetched —
 * the AlAdhan API returns no Ishraq — and derived from the *adjusted* sunrise so
 * that a masjid correcting sunrise keeps the same gap on screen instead of one
 * that no longer matches the sunrise beside it.
 */
export const ishraqBase = (
  sunrise: string,
  sunriseAdjustment: EngineSingleAdjustment | undefined | null
): string =>
  addClockMinutes(applyAdjustment(sunrise, sunriseAdjustment), ISHRAQ_MINUTES_AFTER_SUNRISE);

/**
 * Chasht (Salat al-Duha), as `HH:mm` before its own adjustment. Its window runs
 * from Ishraq to Zawal, but the preferred time in the Hanafi school is once a
 * quarter of the day has passed — the midpoint between sunrise and Zawal — which
 * is what a timetable prints as "Chasht". Follows the adjusted sunrise for the
 * same reason Ishraq does; Zawal is Dhuhr as the API returns it, since a
 * masjid's Dhuhr adjustment is a jamaat preference rather than a solar one.
 */
export const chashtBase = (
  sunrise: string,
  dhuhr: string,
  sunriseAdjustment: EngineSingleAdjustment | undefined | null
): string => {
  const from = applyAdjustment(sunrise, sunriseAdjustment);
  // Clamped so a sunrise manually set past Zawal can't push Chasht backwards
  // into the night; it collapses onto sunrise instead.
  const halfway = Math.max(0, Math.round(clockDifference(from, clockPart(dhuhr)) / 2));
  return addClockMinutes(from, halfway);
};

export const isAdjusted = (adjustment: EngineSingleAdjustment | undefined | null): boolean =>
  !!adjustment && adjustment.type !== 'default';

/**
 * The Jumma variants a masjid has actually configured. A variant counts as
 * active when any of its three categories is non-default; with none set, a
 * single `jumma1` carrying the unadjusted Dhuhr time stands in.
 */
export const activeJummaVariants = (
  adjustments: EnginePrayerAdjustments | undefined | null
): EngineJummaName[] => {
  const active = ENGINE_JUMMA_VARIANTS.filter(variant =>
    ENGINE_CATEGORIES.some(category => isAdjusted(adjustments?.[variant]?.[category]))
  );
  return active.length > 0 ? [...active] : ['jumma1'];
};

export interface EngineDayTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Sunset: string;
}

export interface ResolvedPrayer {
  starts: string;
  athan: string;
  iqamah: string;
}

export interface ResolvedJumma extends ResolvedPrayer {
  name: EngineJummaName;
}

export interface ResolvedDayTimes {
  /** English weekday from AlAdhan, kept so callers need no calendar of their own. */
  weekday: string;
  is_friday: boolean;
  prayers: Record<EngineDailyPrayerName, ResolvedPrayer>;
  /** Empty on every day but Friday. */
  jumma: ResolvedJumma[];
  solar: { sunrise: string; ishraq: string; chasht: string; sunset: string };
}

export interface ResolveDayInput {
  timings: EngineDayTimings;
  weekday: string;
  prayerAdjustments?: EnginePrayerAdjustments | null;
  solarAdjustments?: EngineSolarAdjustments | null;
}

const BASE_TIME_KEYS: Record<EnginePrayerName, keyof EngineDayTimings> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
  jumma1: 'Dhuhr',
  jumma2: 'Dhuhr',
  jumma3: 'Dhuhr',
};

const resolvePrayer = (
  name: EnginePrayerName,
  timings: EngineDayTimings,
  adjustments: EnginePrayerAdjustments | undefined | null
): ResolvedPrayer => {
  const base = timings[BASE_TIME_KEYS[name]];
  const prayer = adjustments?.[name];
  return {
    starts: applyAdjustment(base, prayer?.starts),
    athan: applyAdjustment(base, prayer?.athan),
    iqamah: applyAdjustment(base, prayer?.iqamah),
  };
};

/**
 * One masjid-local day, fully resolved: the five prayers in all three
 * categories, the Jumma variants when the day is a Friday, and the four solar
 * times. All of it derived from the same raw base times, which is why an
 * unconfigured masjid reads identically across the three categories.
 */
export const resolveDayTimes = ({
  timings,
  weekday,
  prayerAdjustments,
  solarAdjustments,
}: ResolveDayInput): ResolvedDayTimes => {
  const isFriday = weekday === 'Friday';
  const sunriseAdjustment = solarAdjustments?.sunrise;

  const prayers = {} as Record<EngineDailyPrayerName, ResolvedPrayer>;
  for (const name of ENGINE_DAILY_PRAYERS) {
    prayers[name] = resolvePrayer(name, timings, prayerAdjustments);
  }

  return {
    weekday,
    is_friday: isFriday,
    prayers,
    jumma: isFriday
      ? activeJummaVariants(prayerAdjustments).map(name => ({
          name,
          ...resolvePrayer(name, timings, prayerAdjustments),
        }))
      : [],
    solar: {
      sunrise: applyAdjustment(timings.Sunrise, sunriseAdjustment),
      ishraq: applyAdjustment(
        ishraqBase(timings.Sunrise, sunriseAdjustment),
        solarAdjustments?.ishraq
      ),
      chasht: applyAdjustment(
        chashtBase(timings.Sunrise, timings.Dhuhr, sunriseAdjustment),
        solarAdjustments?.chasht
      ),
      sunset: applyAdjustment(timings.Sunset, solarAdjustments?.sunset),
    },
  };
};
