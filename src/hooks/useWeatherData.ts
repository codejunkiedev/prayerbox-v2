import { useState, useEffect } from 'react';
import { fetchWeatherForecast } from '@/api';
import type { DisplayLanguage, WeatherForecast } from '@/types';
import type { ErrorMessage } from '@/components/display';
import { useDisplayStore } from '@/store';
import {
  parseOpenWeatherForecast,
  isNullOrUndefined,
  readWeatherCache,
  writeWeatherCache,
} from '@/utils';

/**
 * Custom hook to fetch and manage weather data
 * Fetches weather forecast based on masjid location coordinates
 * Automatically refreshes data every 30 minutes
 * @returns Object containing weather forecast, loading state, and error messages
 */
export function useWeatherData(enabled: boolean = true, language: DisplayLanguage = 'en') {
  const [weatherForecast, setWeatherForecast] = useState<WeatherForecast | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<ErrorMessage | null>(null);

  const { masjidProfile } = useDisplayStore();

  useEffect(() => {
    if (!enabled) return;

    const { latitude, longitude } = masjidProfile || {};

    if (isNullOrUndefined(latitude) || isNullOrUndefined(longitude)) {
      setErrorMessage({
        title: 'Masjid location is missing',
        description:
          'Weather requires latitude and longitude from the masjid profile. Please set the location in the admin panel, or disable weather on this screen.',
      });
      return;
    }

    const abortController = new AbortController();

    // Hydrate from cache so the slide can render before the network call resolves.
    // If the API later fails, the user keeps seeing this stale-but-valid forecast.
    const cached = readWeatherCache(latitude, longitude, language);
    const hadCachedData = cached !== null;
    if (cached) setWeatherForecast(parseOpenWeatherForecast(cached));

    async function getWeatherData(
      lat: number,
      lon: number,
      signal: AbortSignal,
      showSpinner: boolean
    ) {
      if (showSpinner) setIsLoading(true);
      setErrorMessage(null);

      try {
        const data = await fetchWeatherForecast({ lat, lon, signal, language });
        if (data) {
          setWeatherForecast(parseOpenWeatherForecast(data));
          writeWeatherCache(lat, lon, language, data);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        // Keep whatever forecast is already on screen (cached or last successful fetch).
        // If nothing has ever loaded, weatherForecast stays null and the consumer
        // simply omits the weather slide from the slideshow.
        console.error('Failed to fetch weather data', error);
      } finally {
        if (showSpinner) setIsLoading(false);
      }
    }

    getWeatherData(latitude, longitude, abortController.signal, !hadCachedData);

    // Refresh weather data every 30 minutes
    const interval = setInterval(
      () => {
        if (!abortController.signal.aborted) {
          getWeatherData(latitude, longitude, abortController.signal, false);
        }
      },
      30 * 60 * 1000
    );

    return () => {
      abortController.abort();
      clearInterval(interval);
    };
  }, [enabled, masjidProfile, language]);

  return { weatherForecast, isLoading, errorMessage };
}
