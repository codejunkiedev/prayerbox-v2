import { DEFAULT_CUSTOM_THEME } from '@/constants';
import type { CustomThemeBanner, CustomThemeConfig } from '@/types';

/**
 * The config as it may actually come back from the database, as opposed to how
 * it is typed. `custom_theme` is an unvalidated JSONB blob with no backfill, so
 * a screen saved before a control shipped simply has no key for it.
 */
type StoredCustomTheme = {
  layout?: CustomThemeConfig['layout'];
  background?: CustomThemeConfig['background'];
  overlay?: Partial<CustomThemeConfig['overlay']>;
  fonts?: Partial<CustomThemeConfig['fonts']>;
  size?: { scale?: number; groups?: Partial<CustomThemeConfig['size']['groups']> };
  colors?: { global?: string; overrides?: Partial<CustomThemeConfig['colors']['overrides']> };
  visibility?: Partial<CustomThemeConfig['visibility']>;
  banner?: Partial<Omit<CustomThemeBanner, 'background'>> & {
    background?: Partial<CustomThemeBanner['background']>;
  };
};

/**
 * Fills in whatever keys a stored theme predates, so old rows render as if they
 * had been saved with today's defaults. Reading the blob raw would hand
 * `undefined` to code that expects a value — a missing size multiplier yields a
 * `NaNcqw` font size, and a missing sub-object throws outright. Merges one level
 * into each sub-object; the stored value wins wherever it exists.
 *
 * Use this at every read boundary rather than `?? DEFAULT_CUSTOM_THEME`, which
 * only catches a wholly-null theme and not a partial one.
 */
export function resolveCustomTheme(
  stored: CustomThemeConfig | null | undefined
): CustomThemeConfig {
  const defaults = DEFAULT_CUSTOM_THEME;
  if (!stored) return structuredClone(defaults);
  const s = stored as StoredCustomTheme;
  return {
    layout: s.layout ?? defaults.layout,
    background: s.background ?? structuredClone(defaults.background),
    overlay: { ...defaults.overlay, ...s.overlay },
    fonts: { ...defaults.fonts, ...s.fonts },
    size: {
      scale: s.size?.scale ?? defaults.size.scale,
      groups: { ...defaults.size.groups, ...s.size?.groups },
    },
    colors: {
      global: s.colors?.global ?? defaults.colors.global,
      overrides: { ...defaults.colors.overrides, ...s.colors?.overrides },
    },
    visibility: { ...defaults.visibility, ...s.visibility },
    banner: {
      ...defaults.banner,
      ...s.banner,
      background: { ...defaults.banner.background, ...s.banner?.background },
    },
  };
}
