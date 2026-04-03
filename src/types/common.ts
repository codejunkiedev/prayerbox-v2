import type { SingleAdjustmentData } from '@/lib/zod';

export type AdjustmentCategory = 'starts' | 'athan' | 'iqamah';

export interface SingleAdjustment {
  type: SingleAdjustmentData['type'];
  offset?: number;
  manual_time?: string;
}

export interface PrayerAdjustment {
  starts: SingleAdjustment;
  athan: SingleAdjustment;
  iqamah: SingleAdjustment;
}

export interface PrayerAdjustments {
  fajr: PrayerAdjustment;
  sunrise: PrayerAdjustment;
  dhuhr: PrayerAdjustment;
  asr: PrayerAdjustment;
  maghrib: PrayerAdjustment;
  isha: PrayerAdjustment;
  jumma1: PrayerAdjustment;
  jumma2: PrayerAdjustment;
  jumma3: PrayerAdjustment;
}

export interface ProcessedPrayerTiming {
  name: keyof PrayerAdjustments;
  starts: string;
  athan: string;
  iqamah: string;
  arabicName: string;
}

export enum Theme {
  Theme1 = 'theme-1',
  Theme2 = 'theme-2',
}

export type WeatherData = {
  temperature: number;
  feelsLike: number;
  description: string;
  icon: string;
  conditionId: number;
  humidity: number;
  windSpeed: number;
  cityName: string;
};

export type ForecastData = WeatherData & {
  date: Date;
  tempMin: number;
  tempMax: number;
};

export type WeatherForecast = {
  current: WeatherData;
  forecast: ForecastData[];
};
