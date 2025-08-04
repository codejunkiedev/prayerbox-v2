// Weather Background Videos
import clearNightVideo from '@/assets/backgrounds/weather/clear-night.mp4';
import cloudyWeatherVideo from '@/assets/backgrounds/weather/cloudy-day.mp4';
import rainyNightVideo from '@/assets/backgrounds/weather/rainy-night.mp4';
import rainyDayVideo from '@/assets/backgrounds/weather/rainy-day.mp4';
import cloudyNightVideo from '@/assets/backgrounds/weather/cloudy-night.mp4';
import sunnyDayVideo from '@/assets/backgrounds/weather/sunny-day.mp4';

/**
 * Maps weather condition ID and time context to appropriate background video
 * @param conditionId OpenWeather condition ID
 * @param iconCode OpenWeather icon code (contains day/night context)
 * @returns Path to the appropriate background video
 */
export function getWeatherBackgroundVideo(conditionId: number, iconCode: string): string {
  const isDay = iconCode.endsWith('d');
  const conditionGroup = Math.floor(conditionId / 100);

  switch (conditionGroup) {
    case 2: // Thunderstorms (200-299)
      return isDay ? rainyDayVideo : rainyNightVideo;

    case 3: // Drizzle (300-399)
    case 5: // Rain (500-599)
      return isDay ? rainyDayVideo : rainyNightVideo;

    case 6: // Snow (600-699)
      // Use cloudy weather for snow as it's similar conditions
      return isDay ? cloudyWeatherVideo : cloudyNightVideo;

    case 7: // Atmosphere (700-799) - fog, mist, haze, etc.
      return isDay ? cloudyWeatherVideo : cloudyNightVideo;

    case 8: // Clear and Clouds (800-899)
      if (conditionId === 800) {
        // Clear sky
        return isDay ? sunnyDayVideo : clearNightVideo;
      } else if (conditionId === 801) {
        // Few clouds - still mostly clear
        return isDay ? sunnyDayVideo : clearNightVideo;
      } else {
        // More clouds (802-804)
        return isDay ? cloudyWeatherVideo : cloudyNightVideo;
      }

    default:
      // Fallback based on time of day
      return isDay ? sunnyDayVideo : clearNightVideo;
  }
}

/**
 * Determines if current time is during morning/sunrise hours
 * @param currentHour Current hour (0-23)
 * @returns boolean indicating if it's morning time
 */
export function isMorningTime(currentHour: number): boolean {
  // Consider 5 AM to 9 AM as morning/sunrise time
  return currentHour >= 5 && currentHour <= 9;
}
