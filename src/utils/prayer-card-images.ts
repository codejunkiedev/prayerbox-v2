import { Theme, type PrayerAdjustments } from '@/types';

// Theme 1 assets
import theme1FajrCard from '@/assets/themes/theme-1/fajr.png';
import theme1DuhrCard from '@/assets/themes/theme-1/duhr.png';
import theme1AsarCard from '@/assets/themes/theme-1/asar.png';
import theme1MaghribCard from '@/assets/themes/theme-1/maghrib.png';
import theme1IshaCard from '@/assets/themes/theme-1/isha.png';
import theme1JummaCard from '@/assets/themes/theme-1/jumma.png';

// Theme 2 assets
import theme2FajrCard from '@/assets/themes/theme-2/fajr.png';
import theme2DuhrCard from '@/assets/themes/theme-2/duhr.png';
import theme2AsarCard from '@/assets/themes/theme-2/asar.png';
import theme2MaghribCard from '@/assets/themes/theme-2/maghrib.png';
import theme2IshaCard from '@/assets/themes/theme-2/isha.png';
import theme2JummaCard from '@/assets/themes/theme-2/jumma.png';

const theme1Images = {
  fajr: theme1FajrCard,
  dhuhr: theme1DuhrCard,
  asr: theme1AsarCard,
  maghrib: theme1MaghribCard,
  isha: theme1IshaCard,
  jumma1: theme1JummaCard,
  jumma2: theme1JummaCard,
  jumma3: theme1JummaCard,
} as const;

const theme2Images = {
  fajr: theme2FajrCard,
  dhuhr: theme2DuhrCard,
  asr: theme2AsarCard,
  maghrib: theme2MaghribCard,
  isha: theme2IshaCard,
  jumma1: theme2JummaCard,
  jumma2: theme2JummaCard,
  jumma3: theme2JummaCard,
} as const;

const themeImageMaps = {
  [Theme.Theme1]: theme1Images,
  [Theme.Theme2]: theme2Images,
} as const;

/**
 * Gets the prayer card image based on prayer name and theme
 * @param prayerName Name of the prayer (e.g., 'fajr', 'dhuhr', 'jumma1')
 * @param theme Theme to use for the image
 * @returns Path to the prayer card image, fallback to fajr image if not found
 */
export function getPrayerCardImage(prayerName: keyof PrayerAdjustments, theme: Theme): string {
  const imageMap = themeImageMaps[theme];
  // @ts-expect-error - prayerName is a valid key of the imageMap
  return imageMap[prayerName] || imageMap.fajr;
}
