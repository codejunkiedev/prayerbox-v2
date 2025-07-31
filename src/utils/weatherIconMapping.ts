// Weather Icons
import clearDay from '@/assets/icons/weather/clear-day.svg';
import clearNight from '@/assets/icons/weather/clear-night.svg';
import partlyCloudyDay from '@/assets/icons/weather/partly-cloudy-day.svg';
import partlyCloudyNight from '@/assets/icons/weather/partly-cloudy-night.svg';
import cloudy from '@/assets/icons/weather/cloudy.svg';
import overcast from '@/assets/icons/weather/overcast.svg';
import overcastDay from '@/assets/icons/weather/overcast-day.svg';
import overcastNight from '@/assets/icons/weather/overcast-night.svg';
import rain from '@/assets/icons/weather/rain.svg';
import drizzle from '@/assets/icons/weather/drizzle.svg';
import partlyCloudyDayRain from '@/assets/icons/weather/partly-cloudy-day-rain.svg';
import partlyCloudyNightRain from '@/assets/icons/weather/partly-cloudy-night-rain.svg';
import partlyCloudyDayDrizzle from '@/assets/icons/weather/partly-cloudy-day-drizzle.svg';
import partlyCloudyNightDrizzle from '@/assets/icons/weather/partly-cloudy-night-drizzle.svg';
import thunderstorms from '@/assets/icons/weather/thunderstorms.svg';
import thunderstormsDay from '@/assets/icons/weather/thunderstorms-day.svg';
import thunderstormsNight from '@/assets/icons/weather/thunderstorms-night.svg';
import thunderstormsRain from '@/assets/icons/weather/thunderstorms-rain.svg';
import thunderstormsDayRain from '@/assets/icons/weather/thunderstorms-day-rain.svg';
import thunderstormsNightRain from '@/assets/icons/weather/thunderstorms-night-rain.svg';
import snow from '@/assets/icons/weather/snow.svg';
import partlyCloudyDaySnow from '@/assets/icons/weather/partly-cloudy-day-snow.svg';
import partlyCloudyNightSnow from '@/assets/icons/weather/partly-cloudy-night-snow.svg';
import sleet from '@/assets/icons/weather/sleet.svg';
import partlyCloudyDaySleet from '@/assets/icons/weather/partly-cloudy-day-sleet.svg';
import partlyCloudyNightSleet from '@/assets/icons/weather/partly-cloudy-night-sleet.svg';
import mist from '@/assets/icons/weather/mist.svg';
import fog from '@/assets/icons/weather/fog.svg';
import fogDay from '@/assets/icons/weather/fog-day.svg';
import fogNight from '@/assets/icons/weather/fog-night.svg';
import haze from '@/assets/icons/weather/haze.svg';
import hazeDay from '@/assets/icons/weather/haze-day.svg';
import hazeNight from '@/assets/icons/weather/haze-night.svg';
import smoke from '@/assets/icons/weather/smoke.svg';
import partlyCloudyDaySmoke from '@/assets/icons/weather/partly-cloudy-day-smoke.svg';
import partlyCloudyNightSmoke from '@/assets/icons/weather/partly-cloudy-night-smoke.svg';
import dust from '@/assets/icons/weather/dust.svg';
import dustDay from '@/assets/icons/weather/dust-day.svg';
import dustNight from '@/assets/icons/weather/dust-night.svg';
import tornado from '@/assets/icons/weather/tornado.svg';
import hurricane from '@/assets/icons/weather/hurricane.svg';
import notAvailable from '@/assets/icons/weather/not-available.svg';

type WeatherIconMap = {
  [key: string]: string;
};

type WeatherConditionMap = {
  [key: number]: string;
};

// OpenWeather icon code mapping
export const weatherIconMap: WeatherIconMap = {
  // Clear sky
  '01d': clearDay,
  '01n': clearNight,

  // Few clouds
  '02d': partlyCloudyDay,
  '02n': partlyCloudyNight,

  // Scattered clouds
  '03d': cloudy,
  '03n': cloudy,

  // Broken clouds / Overcast
  '04d': overcastDay,
  '04n': overcastNight,

  // Shower rain / Drizzle
  '09d': partlyCloudyDayDrizzle,
  '09n': partlyCloudyNightDrizzle,

  // Rain
  '10d': partlyCloudyDayRain,
  '10n': partlyCloudyNightRain,

  // Thunderstorm
  '11d': thunderstormsDay,
  '11n': thunderstormsNight,

  // Snow
  '13d': partlyCloudyDaySnow,
  '13n': partlyCloudyNightSnow,

  // Atmospheric conditions (mist, fog, haze, etc.)
  '50d': fogDay,
  '50n': fogNight,
};

// OpenWeather condition ID mapping for more specific weather conditions
export const weatherConditionMap: WeatherConditionMap = {
  // Group 2xx: Thunderstorm
  200: thunderstormsRain, // thunderstorm with light rain
  201: thunderstormsRain, // thunderstorm with rain
  202: thunderstormsRain, // thunderstorm with heavy rain
  210: thunderstorms, // light thunderstorm
  211: thunderstorms, // thunderstorm
  212: thunderstorms, // heavy thunderstorm
  221: thunderstorms, // ragged thunderstorm
  230: thunderstormsRain, // thunderstorm with light drizzle
  231: thunderstormsRain, // thunderstorm with drizzle
  232: thunderstormsRain, // thunderstorm with heavy drizzle

  // Group 3xx: Drizzle
  300: drizzle, // light intensity drizzle
  301: drizzle, // drizzle
  302: drizzle, // heavy intensity drizzle
  310: drizzle, // light intensity drizzle rain
  311: drizzle, // drizzle rain
  312: drizzle, // heavy intensity drizzle rain
  313: drizzle, // shower rain and drizzle
  314: drizzle, // heavy shower rain and drizzle
  321: drizzle, // shower drizzle

  // Group 5xx: Rain
  500: rain, // light rain
  501: rain, // moderate rain
  502: rain, // heavy intensity rain
  503: rain, // very heavy rain
  504: rain, // extreme rain
  511: sleet, // freezing rain
  520: rain, // light intensity shower rain
  521: rain, // shower rain
  522: rain, // heavy intensity shower rain
  531: rain, // ragged shower rain

  // Group 6xx: Snow
  600: snow, // light snow
  601: snow, // snow
  602: snow, // heavy snow
  611: sleet, // sleet
  612: sleet, // light shower sleet
  613: sleet, // shower sleet
  615: sleet, // light rain and snow
  616: sleet, // rain and snow
  620: snow, // light shower snow
  621: snow, // shower snow
  622: snow, // heavy shower snow

  // Group 7xx: Atmosphere
  701: mist, // mist
  711: smoke, // smoke
  721: haze, // haze
  731: dust, // sand/dust whirls
  741: fog, // fog
  751: dust, // sand
  761: dust, // dust
  762: dust, // volcanic ash
  771: hurricane, // squalls
  781: tornado, // tornado

  // Group 800: Clear
  800: clearDay, // clear sky (will be overridden by time-based logic)

  // Group 80x: Clouds
  801: partlyCloudyDay, // few clouds: 11-25%
  802: cloudy, // scattered clouds: 25-50%
  803: cloudy, // broken clouds: 51-84%
  804: overcast, // overcast clouds: 85-100%
};

export function getWeatherIcon(iconCode: string): string {
  return weatherIconMap[iconCode] || notAvailable;
}

export function getWeatherIconWithTimeContext(conditionId: number, iconCode: string): string {
  console.log('getWeatherIconWithTimeContext', conditionId, iconCode);
  const isDay = iconCode.endsWith('d');

  // Handle specific conditions that need day/night variations
  switch (Math.floor(conditionId / 100)) {
    case 2: // Thunderstorms
      if (
        (conditionId >= 200 && conditionId <= 202) ||
        (conditionId >= 230 && conditionId <= 232)
      ) {
        return isDay ? thunderstormsDayRain : thunderstormsNightRain;
      }
      return isDay ? thunderstormsDay : thunderstormsNight;

    case 3: // Drizzle
      return isDay ? partlyCloudyDayDrizzle : partlyCloudyNightDrizzle;

    case 5: // Rain
      if (conditionId === 511) return sleet; // freezing rain
      return isDay ? partlyCloudyDayRain : partlyCloudyNightRain;

    case 6: // Snow
      if (
        conditionId === 611 ||
        conditionId === 612 ||
        conditionId === 613 ||
        conditionId === 615 ||
        conditionId === 616
      ) {
        return isDay ? partlyCloudyDaySleet : partlyCloudyNightSleet;
      }
      return isDay ? partlyCloudyDaySnow : partlyCloudyNightSnow;

    case 7: // Atmosphere
      switch (conditionId) {
        case 701:
          return mist;
        case 711:
          return isDay ? partlyCloudyDaySmoke : partlyCloudyNightSmoke;
        case 721:
          return isDay ? hazeDay : hazeNight;
        case 731:
        case 751:
        case 761:
        case 762:
          return isDay ? dustDay : dustNight;
        case 741:
          return isDay ? fogDay : fogNight;
        case 771:
          return hurricane;
        case 781:
          return tornado;
        default:
          return isDay ? fogDay : fogNight;
      }

    case 8: // Clear and Clouds
      if (conditionId === 800) {
        return isDay ? clearDay : clearNight;
      } else if (conditionId === 801) {
        return isDay ? partlyCloudyDay : partlyCloudyNight;
      } else if (conditionId === 802 || conditionId === 803) {
        return cloudy;
      } else if (conditionId === 804) {
        return isDay ? overcastDay : overcastNight;
      }
      break;
  }

  // Fallback to icon code mapping
  return getWeatherIcon(iconCode);
}
