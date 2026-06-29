import type { CustomThemeConfig } from '@/types';

/**
 * Seed config applied the first time a screen switches to the custom prayer
 * theme: a dark green gradient + light overlay with white text, which reads well
 * over Theme 3's transparent-chrome layout. Multipliers default to 1.0 so the
 * base Theme 3 hierarchy is preserved until the user changes something.
 */
export const DEFAULT_CUSTOM_THEME: CustomThemeConfig = {
  background: { type: 'gradient', from: '#064e3b', to: '#022c22', angle: 135 },
  overlay: { enabled: true, color: '#000000', opacity: 0.3 },
  fonts: { english: 'inter', arabic: 'amiri', urdu: 'noto-nastaliq' },
  size: {
    scale: 1,
    groups: { header: 1, names: 1, times: 1, countdown: 1, date: 1 },
  },
  colors: {
    global: '#ffffff',
    overrides: { header: null, names: null, times: null, countdown: null, date: null },
  },
  // Everything on by default — users hide what they don't want.
  visibility: {
    columnStarts: true,
    columnAthan: true,
    columnIqamah: true,
    sunriseSunset: true,
    nextIqamahCard: true,
    hijriDate: true,
    gregorianDate: true,
    clock: true,
  },
};
