import type { GeoapifyResponse } from '@/types';
import { captureExternalFetchError } from '@/lib/sentry';

const GeoapifyBaseUrl = 'https://api.geoapify.com/v1';

type ForwardGeocodePayload = {
  text: string;
  signal?: AbortSignal;
};

type ReverseGeocodePayload = {
  latitude: number;
  longitude: number;
  signal?: AbortSignal;
};

/**
 * Performs reverse geocoding to get location information from coordinates
 * @param payload Object containing latitude, longitude, and optional AbortSignal
 * @returns Promise resolving to Geoapify response with location details
 * @throws Error if API key is missing or request fails
 */
export const reverseGeocode = async ({
  latitude,
  longitude,
  signal,
}: ReverseGeocodePayload): Promise<GeoapifyResponse> => {
  try {
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
    if (!response.ok) throw new Error(`Failed to reverse geocode location: ${response.status}`);
    return response.json();
  } catch (error) {
    captureExternalFetchError(error, {
      source: 'geoapify',
      operation: 'reverseGeocode',
      extra: { latitude, longitude },
    });
    throw error;
  }
};

/**
 * Performs forward geocoding (autocomplete) to get coordinates from a text query
 * @param payload Object containing search text and optional AbortSignal
 * @returns Promise resolving to Geoapify response with location results
 * @throws Error if API key is missing or request fails
 */
export const forwardGeocode = async ({
  text,
  signal,
}: ForwardGeocodePayload): Promise<GeoapifyResponse> => {
  try {
    const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

    if (!apiKey) {
      throw new Error('Geoapify API key not found');
    }

    const url = new URL(`${GeoapifyBaseUrl}/geocode/autocomplete`);
    url.searchParams.set('text', text);
    url.searchParams.set('apiKey', apiKey);
    url.searchParams.set('format', 'geojson');
    url.searchParams.set('limit', '5');

    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`Failed to forward geocode location: ${response.status}`);
    return response.json();
  } catch (error) {
    captureExternalFetchError(error, {
      source: 'geoapify',
      operation: 'forwardGeocode',
      extra: { text },
    });
    throw error;
  }
};
