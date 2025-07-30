import { useState, useEffect } from 'react';
import { fetchWeatherForecast, type WeatherForecast } from '@/api';
import type { MasjidProfile } from '@/types';

export function useWeatherData(masjidProfile: MasjidProfile | null) {
  const [weatherForecast, setWeatherForecast] = useState<WeatherForecast | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getWeatherData() {
      if (!masjidProfile?.latitude || !masjidProfile?.longitude) {
        setError('Location not available');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchWeatherForecast(masjidProfile.latitude, masjidProfile.longitude);
        if (data) {
          setWeatherForecast(data);
        } else {
          setError('Unable to fetch weather data');
        }
      } catch {
        setError('Failed to load weather data');
      } finally {
        setIsLoading(false);
      }
    }

    getWeatherData();

    // Refresh weather data every 30 minutes
    const interval = setInterval(getWeatherData, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [masjidProfile?.latitude, masjidProfile?.longitude]);

  return { weatherForecast, isLoading, error };
}
