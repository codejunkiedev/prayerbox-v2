/**
 * Maps an OpenWeather condition id to a translation key under the
 * `weatherCondition` namespace. OpenWeather's `lang` param only patchily
 * covers Urdu, so we localize by stable condition id ourselves and fall
 * back to the API description for ids we don't recognize.
 *
 * Ids and groups are documented at
 * https://openweathermap.org/weather-conditions.
 */
export function getWeatherConditionKey(conditionId: number): string | null {
  // 2xx: Thunderstorm
  if (conditionId >= 200 && conditionId < 300) return 'weatherCondition.thunderstorm';

  // 3xx: Drizzle
  if (conditionId >= 300 && conditionId < 400) return 'weatherCondition.drizzle';

  // 5xx: Rain — split by intensity for the common ids
  if (conditionId === 500) return 'weatherCondition.lightRain';
  if (conditionId === 501) return 'weatherCondition.moderateRain';
  if (conditionId >= 502 && conditionId <= 504) return 'weatherCondition.heavyRain';
  if (conditionId === 511) return 'weatherCondition.freezingRain';
  if (conditionId >= 520 && conditionId <= 531) return 'weatherCondition.showerRain';

  // 6xx: Snow
  if (conditionId === 600) return 'weatherCondition.lightSnow';
  if (conditionId === 601) return 'weatherCondition.snow';
  if (conditionId === 602) return 'weatherCondition.heavySnow';
  if (conditionId >= 611 && conditionId <= 622) return 'weatherCondition.sleet';

  // 7xx: Atmosphere
  if (conditionId === 701) return 'weatherCondition.mist';
  if (conditionId === 711) return 'weatherCondition.smoke';
  if (conditionId === 721) return 'weatherCondition.haze';
  if (conditionId === 731 || conditionId === 751 || conditionId === 761)
    return 'weatherCondition.dust';
  if (conditionId === 741) return 'weatherCondition.fog';
  if (conditionId === 762) return 'weatherCondition.ash';
  if (conditionId === 771) return 'weatherCondition.squall';
  if (conditionId === 781) return 'weatherCondition.tornado';

  // 8xx: Clear / clouds
  if (conditionId === 800) return 'weatherCondition.clearSky';
  if (conditionId === 801) return 'weatherCondition.fewClouds';
  if (conditionId === 802) return 'weatherCondition.scatteredClouds';
  if (conditionId === 803) return 'weatherCondition.brokenClouds';
  if (conditionId === 804) return 'weatherCondition.overcastClouds';

  return null;
}
