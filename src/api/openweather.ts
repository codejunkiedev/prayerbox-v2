import type { OpenWeatherForecastResponse } from '@/types';

type WeatherForecastPayload = {
  lat: number;
  lon: number;
  signal: AbortSignal;
};

/**
 * Fetches 5-day weather forecast from OpenWeather API
 * @param payload Object containing latitude, longitude, and AbortSignal
 * @returns Promise resolving to OpenWeather forecast response with 5-day forecast data
 * @throws Error if API key is missing or request fails
 */
export const fetchWeatherForecast = async ({
  lat,
  lon,
  signal,
}: WeatherForecastPayload): Promise<OpenWeatherForecastResponse> => {
  const apiKey = import.meta.env.VITE_OPEN_WEATHER_API_KEY;

  if (!apiKey) {
    throw new Error('OpenWeather API key is not configured');
  }

  const url = new URL(`https://api.openweathermap.org/data/2.5/forecast`);
  url.searchParams.set('lat', lat.toString());
  url.searchParams.set('lon', lon.toString());
  url.searchParams.set('appid', apiKey);
  url.searchParams.set('units', 'metric');

  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Weather API error: ${response.status}`);
  return response.json();
};
