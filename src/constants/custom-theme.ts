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
  fonts: { latin: 'inter', arabic: 'amiri' },
  size: {
    scale: 1,
    groups: { header: 1, names: 1, times: 1, countdown: 1, date: 1 },
  },
  colors: {
    header: '#ffffff',
    names: '#ffffff',
    times: '#ffffff',
    countdown: '#ffffff',
    date: '#ffffff',
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

/**
 * Fills any missing keys on a saved custom-theme config from the defaults, so
 * configs persisted before a field existed (e.g. `visibility`) still render and
 * edit correctly. Returns a fresh object; never mutates the input.
 */
export function normalizeCustomTheme(cfg?: CustomThemeConfig | null): CustomThemeConfig {
  const base = DEFAULT_CUSTOM_THEME;
  if (!cfg) return structuredClone(base);
  return {
    ...base,
    ...cfg,
    background: cfg.background ?? base.background,
    overlay: { ...base.overlay, ...cfg.overlay },
    fonts: { ...base.fonts, ...cfg.fonts },
    size: {
      scale: cfg.size?.scale ?? base.size.scale,
      groups: { ...base.size.groups, ...cfg.size?.groups },
    },
    colors: { ...base.colors, ...cfg.colors },
    visibility: { ...base.visibility, ...cfg.visibility },
  };
}
