import type {
  ForecastData,
  OpenWeatherForecastResponse,
  WeatherData,
  WeatherForecast,
} from '@/types';

export const parseOpenWeatherForecast = (data: OpenWeatherForecastResponse): WeatherForecast => {
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

  // Group forecast by day and get daily min/max
  const dailyForecasts = new Map<string, ForecastData>();
  const today = new Date().toDateString();

  data.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dateKey = date.toDateString();

    // Skip today's data for forecast (we use it for current weather)
    if (dateKey === today) return;

    const existing = dailyForecasts.get(dateKey);

    if (!existing || date.getHours() === 12) {
      // Convert wind speed based on units
      let itemWindSpeed = item.wind.speed;
      itemWindSpeed = Math.round(itemWindSpeed * 3.6); // Convert m/s to km/h

      // Prefer noon data
      dailyForecasts.set(dateKey, {
        date,
        temperature: Math.round(item.main.temp),
        feelsLike: Math.round(item.main.feels_like),
        tempMin: existing
          ? Math.min(existing.tempMin, Math.round(item.main.temp_min))
          : Math.round(item.main.temp_min),
        tempMax: existing
          ? Math.max(existing.tempMax, Math.round(item.main.temp_max))
          : Math.round(item.main.temp_max),
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        conditionId: item.weather[0].id,
        humidity: item.main.humidity,
        windSpeed: itemWindSpeed,
        cityName: data.city.name,
      });
    } else if (existing) {
      // Update min/max temps
      existing.tempMin = Math.min(existing.tempMin, Math.round(item.main.temp_min));
      existing.tempMax = Math.max(existing.tempMax, Math.round(item.main.temp_max));
    }
  });

  // Convert to array and sort by date, limit to 7 days
  const forecast = Array.from(dailyForecasts.values())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 7);

  return { current: currentWeather, forecast };
};
