import type { CustomThemeConfig } from '@/types';

/** Longest announcement the banner accepts. Enforced in the controls. */
export const BANNER_MAX_LENGTH = 500;

/**
 * Seed config applied the first time a screen switches to the custom prayer
 * theme: a dark green gradient + light overlay with white text, which reads well
 * over the transparent-chrome layouts. Multipliers default to 1.0 so each
 * layout's own typographic hierarchy is preserved until the user changes
 * something. `layout` seeds to `table` — the only arrangement that existed
 * before the selector shipped, so it is also what every stored theme without a
 * `layout` key resolves to (see `resolveCustomTheme`).
 */
export const DEFAULT_CUSTOM_THEME: CustomThemeConfig = {
  layout: 'table',
  background: { type: 'gradient', from: '#064e3b', to: '#022c22', angle: 135 },
  overlay: { enabled: true, color: '#000000', opacity: 0.3 },
  fonts: { english: 'inter', arabic: 'amiri', urdu: 'noto-nastaliq' },
  size: {
    scale: 1,
    groups: { header: 1, names: 1, times: 1, countdown: 1, date: 1, masjidName: 1, banner: 1 },
  },
  colors: {
    global: '#ffffff',
    overrides: {
      header: null,
      names: null,
      times: null,
      countdown: null,
      date: null,
      masjidName: null,
      banner: null,
    },
  },
  // Everything on by default — users hide what they don't want.
  visibility: {
    columnStarts: true,
    columnAthan: true,
    columnIqamah: true,
    masjidName: true,
    sunriseSunset: true,
    nextIqamahCard: true,
    hijriDate: true,
    gregorianDate: true,
    clock: true,
  },
  banner: {
    enabled: false,
    text: '',
    position: 'bottom',
    direction: 'ltr',
    font: 'inter',
    background: { color: '#000000', opacity: 0.6 },
    speed: 'normal',
  },
};
