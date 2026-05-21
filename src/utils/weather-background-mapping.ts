import type { ScreenOrientation } from '@/types';

/**
 * Weather background images, bundled locally. Vite resolves each glob entry to
 * a hashed asset URL at build time. Files are named by OpenWeather icon code
 * (e.g. `01d`, `10n`) — the complete set of codes the API can return — and
 * exist in both `landscape` and `portrait` orientations.
 */
const landscapeImages = import.meta.glob<string>('../assets/backgrounds/weather/landscape/*.jpg', {
  eager: true,
  import: 'default',
});
const portraitImages = import.meta.glob<string>('../assets/backgrounds/weather/portrait/*.jpg', {
  eager: true,
  import: 'default',
});

/** Icon code used when the API returns an unrecognised code. */
const FALLBACK_ICON_CODE = '01d';

/** Builds an `iconCode -> asset URL` lookup from a glob import map. */
function indexByIconCode(images: Record<string, string>): Record<string, string> {
  const byCode: Record<string, string> = {};
  for (const [path, url] of Object.entries(images)) {
    const code = path.slice(path.lastIndexOf('/') + 1, path.lastIndexOf('.'));
    byCode[code] = url;
  }
  return byCode;
}

const landscapeByCode = indexByIconCode(landscapeImages);
const portraitByCode = indexByIconCode(portraitImages);

/**
 * Returns the bundled weather background image for an OpenWeather icon code.
 *
 * @param iconCode OpenWeather icon code (e.g. '01d', '50n')
 * @param orientation Screen orientation; only 'portrait' uses portrait images
 * @returns Asset URL of the appropriate background image
 */
export function getWeatherBackgroundImage(
  iconCode: string,
  orientation: ScreenOrientation = 'landscape'
): string {
  const byCode = orientation === 'portrait' ? portraitByCode : landscapeByCode;
  return byCode[iconCode] ?? byCode[FALLBACK_ICON_CODE];
}
