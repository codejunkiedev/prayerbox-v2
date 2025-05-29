export type AlAdhanPrayerTimes = {
  timings: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Sunset: string;
    Maghrib: string;
    Isha: string;
    Imsak: string;
    Midnight: string;
    Firstthird: string;
    Lastthird: string;
  };
  date: {
    readable: string;
    timestamp: string;
    hijri: {
      date: string;
      format: string;
      day: string;
      weekday: { en: string; ar: string };
      month: { number: number; en: string; ar: string; days: number };
      year: string;
      designation: { abbreviated: string; expanded: string };
      holidays: string[];
      adjustedHolidays: string[];
      method: string;
    };
    gregorian: {
      date: string;
      format: string;
      day: string;
      weekday: { en: string };
      month: { number: number; en: string };
      year: string;
      designation: { abbreviated: string; expanded: string };
      lunarSighting: false;
    };
  };
  meta: {
    latitude: number;
    longitude: number;
    timezone: string;
    method: {
      id: number;
      name: string;
      params: { Fajr: number; Isha: number };
      location: { latitude: number; longitude: number };
    };
    latitudeAdjustmentMethod: string;
    midnightMode: string;
    school: string;
    offset: {
      Imsak: number;
      Fajr: number;
      Sunrise: number;
      Dhuhr: number;
      Asr: number;
      Sunset: number;
      Maghrib: number;
      Isha: number;
      Midnight: number;
    };
  };
};

export type GeoapifyResponse = {
  type: string;
  features: Array<{
    type: string;
    properties: {
      datasource: {
        sourcename: string;
        attribution: string;
        license: string;
        url: string;
      };
      name: string;
      country: string;
      country_code: string;
      state: string;
      city: string;
      municipality: string;
      postcode: string;
      suburb: string;
      street: string;
      iso3166_2: string;
      lon: number;
      lat: number;
      distance: number;
      result_type: string;
      formatted: string;
      address_line1: string;
      address_line2: string;
      timezone: {
        name: string;
        offset_STD: string;
        offset_STD_seconds: number;
        offset_DST: string;
        offset_DST_seconds: number;
        abbreviation_STD: string;
        abbreviation_DST: string;
      };
      plus_code: string;
      plus_code_short: string;
      rank: { importance: number; popularity: number };
      place_id: string;
    };
    geometry: { type: string; coordinates: [number, number] };
    bbox: [number, number, number, number];
  }>;
  query: { lat: number; lon: number; plus_code: string };
};
