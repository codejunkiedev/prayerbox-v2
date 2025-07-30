export interface WeatherData {
  temperature: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  cityName: string;
}

export interface ForecastData extends WeatherData {
  date: Date;
  tempMin: number;
  tempMax: number;
}

export interface WeatherForecast {
  current: WeatherData;
  forecast: ForecastData[];
}

interface OpenWeatherCurrentResponse {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  name: string;
}

interface OpenWeatherForecastResponse {
  city: {
    name: string;
  };
  list: Array<{
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      humidity: number;
    };
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
    wind: {
      speed: number;
    };
    dt_txt: string;
  }>;
}

export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData | null> {
  const apiKey = import.meta.env.VITE_OPEN_WEATHER_API_KEY;

  if (!apiKey) {
    console.error('OpenWeather API key is not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data: OpenWeatherCurrentResponse = await response.json();

    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      cityName: data.name,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
}

export async function fetchWeatherForecast(
  lat: number,
  lon: number
): Promise<WeatherForecast | null> {
  const apiKey = import.meta.env.VITE_OPEN_WEATHER_API_KEY;

  if (!apiKey) {
    console.error('OpenWeather API key is not configured');
    return null;
  }

  try {
    // Fetch current weather
    const currentWeather = await fetchWeatherData(lat, lon);
    if (!currentWeather) return null;

    // Fetch forecast data
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data: OpenWeatherForecastResponse = await response.json();

    // Group forecast by day and get daily min/max
    const dailyForecasts = new Map<string, ForecastData>();

    data.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toDateString();

      // Skip today's data as we already have current weather
      if (dateKey === new Date().toDateString()) return;

      const existing = dailyForecasts.get(dateKey);

      if (!existing || date.getHours() === 12) {
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
          humidity: item.main.humidity,
          windSpeed: Math.round(item.wind.speed * 3.6),
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

    return {
      current: currentWeather,
      forecast,
    };
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    return null;
  }
}
