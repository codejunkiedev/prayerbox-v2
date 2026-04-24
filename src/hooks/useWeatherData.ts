import { useState, useEffect } from 'react';
import { fetchWeatherForecast } from '@/api';
import type { WeatherForecast } from '@/types';
import type { ErrorMessage } from '@/components/display';
import { useDisplayStore } from '@/store';
import { parseOpenWeatherForecast, isNullOrUndefined } from '@/utils';

/**
 * Custom hook to fetch and manage weather data
 * Fetches weather forecast based on masjid location coordinates
 * Automatically refreshes data every 30 minutes
 * @returns Object containing weather forecast, loading state, and error messages
 */
export function useWeatherData(enabled: boolean = true) {
  const [weatherForecast, setWeatherForecast] = useState<WeatherForecast | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<ErrorMessage | null>(null);

  const { masjidProfile } = useDisplayStore();

  useEffect(() => {
    const abortController = new AbortController();

    async function getWeatherData(signal: AbortSignal) {
      const { latitude, longitude } = masjidProfile || {};

      if (isNullOrUndefined(latitude) || isNullOrUndefined(longitude)) {
        setErrorMessage({
          title: 'Masjid location is missing',
          description:
            'Weather requires latitude and longitude from the masjid profile. Please set the location in the admin panel, or disable weather on this screen.',
        });
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const data = await fetchWeatherForecast({ lat: latitude, lon: longitude, signal });
        if (data) {
          setWeatherForecast(parseOpenWeatherForecast(data));
        } else {
          setErrorMessage({
            title: 'Unable to fetch weather data',
            description: 'Weather service returned no data. Please try again later.',
          });
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          console.log('Weather fetch aborted');
        } else {
          setErrorMessage({
            title: 'Failed to load weather data',
            description:
              'Unable to connect to weather service. Please check your internet connection and try again.',
          });
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (!enabled) return () => abortController.abort();

    getWeatherData(abortController.signal);

    // Refresh weather data every 30 minutes
    const interval = setInterval(
      () => {
        if (!abortController.signal.aborted) {
          getWeatherData(abortController.signal);
        }
      },
      30 * 60 * 1000
    );

    return () => {
      abortController.abort();
      clearInterval(interval);
    };
  }, [enabled, masjidProfile]);

  return { weatherForecast, isLoading, errorMessage };
}
