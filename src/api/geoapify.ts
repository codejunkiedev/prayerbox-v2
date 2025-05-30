import type { GeoapifyResponse } from '@/types';

const GeoapifyBaseUrl = 'https://api.geoapify.com/v1';

type ReverseGeocodePayload = {
  latitude: number;
  longitude: number;
  signal?: AbortSignal;
};

export const reverseGeocode = async ({
  latitude,
  longitude,
  signal,
}: ReverseGeocodePayload): Promise<GeoapifyResponse> => {
  const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

  if (!apiKey) {
    throw new Error('Geoapify API key not found');
  }

  const url = new URL(`${GeoapifyBaseUrl}/geocode/reverse`);
  url.searchParams.set('lat', latitude.toString());
  url.searchParams.set('lon', longitude.toString());
  url.searchParams.set('apiKey', apiKey);
  url.searchParams.set('format', 'geojson');

  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error('Failed to reverse geocode location');
  return response.json();
};
