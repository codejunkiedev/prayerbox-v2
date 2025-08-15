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
