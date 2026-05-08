import type { OpenWeatherForecastResponse } from '@/types';

const WEATHER_CACHE_KEY = 'weather_forecast_cache_v1';

type WeatherCacheEntry = {
  lat: number;
  lon: number;
  data: OpenWeatherForecastResponse;
};

export const readWeatherCache = (lat: number, lon: number): OpenWeatherForecastResponse | null => {
  try {
    const raw = localStorage.getItem(WEATHER_CACHE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as WeatherCacheEntry;
    if (entry.lat !== lat || entry.lon !== lon) return null;
    return entry.data;
  } catch {
    return null;
  }
};

export const writeWeatherCache = (
  lat: number,
  lon: number,
  data: OpenWeatherForecastResponse
): void => {
  try {
    const entry: WeatherCacheEntry = { lat, lon, data };
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Ignore quota / serialization errors — cache is best-effort.
  }
};
