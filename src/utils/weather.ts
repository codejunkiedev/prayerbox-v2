import type {
  ForecastData,
  OpenWeatherForecastResponse,
  WeatherData,
  WeatherForecast,
} from '@/types';
import { nowInTimeZone, toZonedWallClock } from './timezone';

/**
 * Reduces OpenWeather's 3-hourly list to current conditions plus one entry per
 * upcoming day, resolved against the masjid's clock rather than this device's.
 * A null zone falls back to the device's.
 */
export const parseOpenWeatherForecast = (
  data: OpenWeatherForecastResponse,
  timeZone: string | null
): WeatherForecast => {
  // Get current weather from the first forecast item (most recent)
  const currentItem = data.list[0];

  // Convert wind speed based on units
  let currentWindSpeed = currentItem.wind.speed;
  currentWindSpeed = Math.round(currentWindSpeed * 3.6); // Convert m/s to km/h

  const currentWeather: WeatherData = {
    temperature: Math.round(currentItem.main.temp),
    feelsLike: Math.round(currentItem.main.feels_like),
    description: currentItem.weather[0].description,
    icon: currentItem.weather[0].icon,
    conditionId: currentItem.weather[0].id,
    humidity: currentItem.main.humidity,
    windSpeed: currentWindSpeed,
    cityName: data.city.name,
  };

  // Group forecast by day and get daily min/max, on the masjid's calendar
  const dailyForecasts = new Map<string, ForecastData>();
  // How far each day's chosen sample sits from noon, so a closer one replaces it
  const distanceFromNoon = new Map<string, number>();
  const today = nowInTimeZone(timeZone).toDateString();

  data.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    // Slots are UTC-aligned, so at UTC+5 they fall at 05:00, 08:00, 11:00, …
    // and none is ever exactly noon. Take the closest rather than testing for
    // 12, which also covers offsets like +5:30 and +5:45.
    const wall = toZonedWallClock(date, timeZone);
    const dateKey = wall.toDateString();

    // Skip today's data for forecast (we use it for current weather)
    if (dateKey === today) return;

    const existing = dailyForecasts.get(dateKey);
    const noonDistance = Math.abs(wall.getHours() * 60 + wall.getMinutes() - 12 * 60);

    const tempMin = existing
      ? Math.min(existing.tempMin, Math.round(item.main.temp_min))
      : Math.round(item.main.temp_min);
    const tempMax = existing
      ? Math.max(existing.tempMax, Math.round(item.main.temp_max))
      : Math.round(item.main.temp_max);

    if (!existing || noonDistance < (distanceFromNoon.get(dateKey) ?? Infinity)) {
      distanceFromNoon.set(dateKey, noonDistance);

      dailyForecasts.set(dateKey, {
        date,
        temperature: Math.round(item.main.temp),
        feelsLike: Math.round(item.main.feels_like),
        tempMin,
        tempMax,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        conditionId: item.weather[0].id,
        humidity: item.main.humidity,
        windSpeed: Math.round(item.wind.speed * 3.6), // m/s to km/h
        cityName: data.city.name,
      });
    } else {
      existing.tempMin = tempMin;
      existing.tempMax = tempMax;
    }
  });

  // Convert to array and sort by date, limit to 7 days
  const forecast = Array.from(dailyForecasts.values())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 7);

  return { current: currentWeather, forecast };
};
