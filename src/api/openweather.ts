import type { DisplayLanguage, OpenWeatherForecastResponse } from '@/types';
import { captureExternalFetchError } from '@/lib/sentry';

type WeatherForecastPayload = {
  lat: number;
  lon: number;
  signal: AbortSignal;
  language?: DisplayLanguage;
};

// OpenWeather's short codes for the `lang` query param. Coverage for ur/ar
// is patchy — many condition strings fall back to English — but passing the
// hint still localizes some fields (e.g. city name in some responses).
const OPEN_WEATHER_LANG: Record<DisplayLanguage, string> = {
  en: 'en',
  ur: 'ur',
  ar: 'ar',
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
  language = 'en',
}: WeatherForecastPayload): Promise<OpenWeatherForecastResponse> => {
  try {
    const apiKey = import.meta.env.VITE_OPEN_WEATHER_API_KEY;

    if (!apiKey) {
      throw new Error('OpenWeather API key is not configured');
    }

    const url = new URL(`https://api.openweathermap.org/data/2.5/forecast`);
    url.searchParams.set('lat', lat.toString());
    url.searchParams.set('lon', lon.toString());
    url.searchParams.set('appid', apiKey);
    url.searchParams.set('units', 'metric');
    url.searchParams.set('lang', OPEN_WEATHER_LANG[language]);

    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`Weather API error: ${response.status}`);
    return response.json();
  } catch (error) {
    captureExternalFetchError(error, {
      source: 'openweather',
      operation: 'fetchWeatherForecast',
      extra: { lat, lon },
    });
    throw error;
  }
};
