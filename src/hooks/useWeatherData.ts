import { useState, useEffect } from 'react';
import { fetchWeatherForecast } from '@/api';
import type { WeatherForecast } from '@/types';
import type { ErrorMessage } from '@/components/display';
import { useDisplayStore } from '@/store';
import { parseOpenWeatherForecast } from '@/utils/weather';
import { isNullOrUndefined } from '@/utils';

export function useWeatherData() {
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
          title: 'Location not available',
          description:
            'Weather data requires location coordinates to be set in your masjid profile',
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
  }, [masjidProfile]);

  return { weatherForecast, isLoading, errorMessage };
}
