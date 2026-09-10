import { useEffect, useMemo, useRef } from 'react';
import type {
  AlAdhanPrayerTimes,
  PrayerAdjustments,
  PrayerAlertSound,
  PrayerAlertTrigger,
  PrayerTimes,
} from '@/types';
import {
  getFilteredJummaPrayerNames,
  getProcessedPrayerTimings,
  instantOnZonedDay,
  isFridayPrayer,
  nowInTimeZone,
  parseWallClockTime,
  playAlertBeep,
  primeAudioPlayback,
} from '@/utils';

type Options = {
  triggers: PrayerAlertTrigger[];
  sound: PrayerAlertSound;
  prayerTimes: AlAdhanPrayerTimes | null;
  prayerTimeSettings: PrayerTimes | null;
  /** The masjid's IANA zone; null falls back to the device's. */
  timeZone?: string | null;
};

const TICK_MS = 1000;

/**
 * Longest gap between ticks we'll still fire across. A sleeping TV, a throttled
 * tab or a corrected system clock can leave a much bigger hole, and beeping then
 * would announce a prayer that already passed — better to stay quiet.
 */
const MAX_CATCH_UP_MS = 2 * 60 * 1000;

/**
 * Resolves a formatted prayer time onto the masjid's current calendar day.
 *
 * The prayer strings are the masjid's wall clock, so the instant they name has
 * to be worked out in the masjid's zone — resolving them against the device's
 * day would beep at the wrong moment anywhere else.
 */
const resolveOnDay = (time: string, zonedDay: Date, timeZone: string | null): number | null => {
  const parsed = parseWallClockTime(time);
  if (!parsed) return null;

  return instantOnZonedDay(zonedDay, parsed.hours, parsed.minutes, timeZone).getTime();
};

/**
 * Sounds an alert on the display the moment a prayer's athan or iqamah time
 * arrives — the instant the countdown would hit zero. An empty `triggers` list
 * is a screen with the alert switched off.
 *
 * Deliberately lives at the page level rather than inside the prayer-times
 * slide, so an alert fires whichever slide happens to be showing (and even when
 * the screen doesn't show prayer times at all).
 */
export function usePrayerAlert({
  triggers,
  sound,
  prayerTimes,
  prayerTimeSettings,
  timeZone = null,
}: Options): void {
  const active = sound !== 'silent' && triggers.length > 0;

  /**
   * The distinct clock times to watch, as `hh:mm a` strings. Deduped so a
   * prayer whose athan and iqamah are the same minute beeps once, not twice.
   */
  const watchedTimes = useMemo(() => {
    if (!active || !prayerTimes) return [] as string[];

    const timings = getProcessedPrayerTimings(prayerTimes, prayerTimeSettings);

    // On Friday the Jumma congregations replace Dhuhr; every other day they
    // aren't held at all, so alerting on them would beep at an empty hall.
    const isFriday = isFridayPrayer(prayerTimes.date);
    const midday: (keyof PrayerAdjustments)[] = isFriday
      ? getFilteredJummaPrayerNames(prayerTimeSettings)
      : ['dhuhr'];
    const alerted: (keyof PrayerAdjustments)[] = ['fajr', ...midday, 'asr', 'maghrib', 'isha'];

    const times = new Set<string>();
    alerted.forEach(name => {
      const timing = timings.find(prayer => prayer.name === name);
      if (!timing) return;
      triggers.forEach(trigger => times.add(timing[trigger]));
    });

    return [...times];
  }, [active, triggers, prayerTimes, prayerTimeSettings]);

  // Read the schedule through a ref so refreshed prayer times never restart the
  // ticker below. Restarting would reset its cursor to "now", and a time that
  // fell between the restart and the next tick would be skipped silently.
  const watchedTimesRef = useRef(watchedTimes);
  watchedTimesRef.current = watchedTimes;

  // Same reasoning: a zone arriving after mount must not restart the ticker.
  const timeZoneRef = useRef(timeZone);
  timeZoneRef.current = timeZone;

  useEffect(() => {
    if (!active) return;
    return primeAudioPlayback();
  }, [active]);

  useEffect(() => {
    if (!active) return;

    // Start the cursor at mount so a screen that boots mid-afternoon doesn't
    // replay every alert the day has already been through.
    let checkedThrough = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const since = checkedThrough;
      checkedThrough = now;

      if (now - since > MAX_CATCH_UP_MS) return;

      // Resolve against the current day on every tick so the alert keeps
      // working across midnight without waiting for new prayer-time data.
      const zone = timeZoneRef.current;
      const reference = nowInTimeZone(zone);
      const due = watchedTimesRef.current.some(time => {
        const at = resolveOnDay(time, reference, zone);
        return at !== null && at > since && at <= now;
      });

      if (due) void playAlertBeep();
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [active]);
}
