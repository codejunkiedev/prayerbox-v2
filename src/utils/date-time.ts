import type { AlAdhanPrayerTimes, DisplayLanguage } from '@/types';
import { getLocale } from '@/i18n';
import {
  getMonth,
  getYear,
  format,
  parse,
  addMinutes,
  getDay,
  getHours,
  getMinutes,
  setHours,
  setMinutes,
  addDays,
  subDays,
} from 'date-fns';

/**
 * Gets the current date
 */
export const getCurrentDate = (): Date => {
  return new Date();
};

/**
 * Gets the current day of the month
 */
export const getCurrentDay = (): number => {
  return new Date().getDate();
};

/**
 * Extracts the year and month from a date
 * @param date Date object
 * @returns [year, month] where month is 1-indexed (January = 1)
 */
export const getYearAndMonth = (date: Date): [number, number] => {
  return [getYear(date), getMonth(date) + 1]; // month is 0-indexed in date-fns, so add 1
};

/**
 * Formats a time string from 24-hour format to 12-hour format
 * @param timeString Time string in HH:mm format
 * @returns Formatted time string in h:mm a format
 */
export const formatTime = (timeString: string): string => {
  try {
    return format(parse(timeString, 'HH:mm', new Date()), 'hh:mm a');
  } catch {
    return timeString;
  }
};

/**
 * Adds minutes to a time
 * @param timeString Time string in HH:mm format
 * @param minutes Number of minutes to add (can be negative)
 * @returns Adjusted time string in HH:mm format
 */
export const addTimeMinutes = (timeString: string, minutes: number): string => {
  try {
    const parsedTime = parse(timeString, 'HH:mm', new Date());
    const adjustedTime = addMinutes(parsedTime, minutes);
    return format(adjustedTime, 'HH:mm');
  } catch {
    return timeString;
  }
};

/**
 * Checks if a date is a Friday
 * @param dateStr Date string in yyyy-MM-dd format
 * @returns Boolean indicating if the date is a Friday
 */
export const isFriday = (dateStr: string): boolean => {
  return getDay(dateStr) === 5; // 5 is Friday in JS date
};

/**
 * Converts a time string to a Date object
 * @param timeString Time string in HH:mm format
 * @returns Date object or undefined if parsing fails
 */
export const parseTimeString = (timeString: string): Date | undefined => {
  if (!timeString) return undefined;
  try {
    return parse(timeString, 'HH:mm', new Date());
  } catch {
    return undefined;
  }
};

/**
 * Converts a Date object to a time string
 * @param time Date object
 * @returns Time string in HH:mm format
 */
export const formatTimeString = (time: Date): string => {
  return format(time, 'HH:mm');
};

/**
 * Formats a date with time
 * @param date Date object or date string
 * @param formatStr Format string (default: 'MMM d, yyyy h:mm a')
 * @returns Formatted date string
 */
export const formatDateWithTime = (
  date: Date | string,
  formatStr: string = 'MMM d, yyyy h:mm a'
): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, formatStr);
  } catch {
    return '';
  }
};

/**
 * Formats a date for display in the time picker
 * @param date Date object
 * @returns Formatted time string in 12-hour format (hh:mm a)
 */
export const formatTimePickerTime = (date: Date): string => {
  return format(date, 'hh:mm a');
};

/**
 * Formats a date for display in the date-time picker
 * @param date Date object
 * @returns Formatted date-time string (MM/dd/yyyy hh:mm a)
 */
export const formatDateTimePickerDate = (date: Date): string => {
  return format(date, 'MM/dd/yyyy hh:mm a');
};

/**
 * Formats a date for display
 * @param date Date object
 * @returns Formatted date string (dd-MM-yyyy)
 */
export const formatDate = (date: Date): string => {
  return format(date, 'dd-MM-yyyy');
};

/**
 * Hijri month names by 1-indexed month number. The AlAdhan API only localizes
 * hijri months to English and Arabic, so Urdu is supplied here. Keying by the
 * API's `month.number` keeps the displayed month consistent with the API's
 * day/year regardless of calendar-conversion differences.
 */
const HIJRI_MONTHS: Record<'ur' | 'ar', string[]> = {
  ur: [
    'محرم',
    'صفر',
    'ربیع الاول',
    'ربیع الثانی',
    'جمادی الاول',
    'جمادی الثانی',
    'رجب',
    'شعبان',
    'رمضان',
    'شوال',
    'ذوالقعدہ',
    'ذوالحجہ',
  ],
  ar: [
    'محرم',
    'صفر',
    'ربيع الأول',
    'ربيع الآخر',
    'جمادى الأولى',
    'جمادى الآخرة',
    'رجب',
    'شعبان',
    'رمضان',
    'شوال',
    'ذو القعدة',
    'ذو الحجة',
  ],
};

/** Hijri era marker per language. */
const HIJRI_ERA: Record<DisplayLanguage, string> = { en: 'AH', ur: 'ھ', ar: 'هـ' };

/**
 * Formats a gregorian date for display.
 * @param date AlAdhanPrayerTimes['date']['gregorian']
 * @param lang Display language; non-English uses Intl with Latin digits
 * @returns Formatted gregorian date string (weekday, day month year)
 */
export const formatGregorianDate = (
  date: AlAdhanPrayerTimes['date']['gregorian'],
  lang: DisplayLanguage = 'en'
): string => {
  const fallback = `${date.weekday.en}, ${date.day} ${date.month.en} ${date.year}`;
  if (lang === 'en') return fallback;
  try {
    const dateObj = new Date(Number(date.year), date.month.number - 1, Number(date.day));
    return new Intl.DateTimeFormat(getLocale(lang), {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      numberingSystem: 'latn',
    }).format(dateObj);
  } catch {
    return fallback;
  }
};

/**
 * Formats a hijri date for display.
 * @param date AlAdhanPrayerTimes['date']['hijri']
 * @param lang Display language; non-English localizes the month name and era
 * @returns Formatted hijri date string
 */
export const formatHijriDate = (
  date: AlAdhanPrayerTimes['date']['hijri'],
  lang: DisplayLanguage = 'en'
): string => {
  if (lang === 'en') {
    return `${date.month.en} ${date.day}, ${date.year} ${date.designation.abbreviated}`;
  }
  const monthName = HIJRI_MONTHS[lang][date.month.number - 1] ?? date.month.en;
  return `${date.day} ${monthName} ${date.year} ${HIJRI_ERA[lang]}`;
};

/**
 * Formats a time string
 * @param time Time string in hh:mm a format
 * @returns Formatted time string (timeNumber, amPm)
 */
export const formatTimeNumber = (time: string): { timeNumber: string; amPm: string } => {
  const timeParts = time.split(' ');
  const timeNumber = timeParts[0]?.startsWith('0') ? timeParts[0]?.substring(1) : timeParts[0];
  const amPm = timeParts[1];
  return { timeNumber, amPm };
};

/**
 * Adds or subtracts days from a date
 * @param date Date object
 * @param offset Number of days to add or subtract (can be negative)
 * @returns Date object with the days added or subtracted
 */
export const addOrSubtractDays = (date: Date, offset: number): Date => {
  if (offset === 0) return date;
  else if (offset > 0) return addDays(date, offset);
  else return subDays(date, Math.abs(offset));
};

/**
 * Time-related utility functions exported from date-fns
 */
export { getHours, getMinutes, setHours, setMinutes };
