import type { AlAdhanPrayerTimes } from '@/types';
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

export const formatGregorianDate = (date: AlAdhanPrayerTimes['date']['gregorian']): string => {
  return `${date.weekday.en}, ${date.day} ${date.month.en} ${date.year}`;
};

export const formatHijriDate = (date: AlAdhanPrayerTimes['date']['hijri']): string => {
  return `${date.month.en} ${date.day}, ${date.year} ${date.designation.abbreviated}`;
};

/**
 * Time-related utility functions exported from date-fns
 */
export { getHours, getMinutes, setHours, setMinutes };
