import { DEFAULT_CUSTOM_THEME } from '@/constants';
import type { CustomThemeBanner, CustomThemeConfig, MasjidProfile } from '@/types';

// Non-breaking, because the ticker renders in normal whitespace mode: a run of
// ordinary spaces collapses to a single one, which crams the segments together
// no matter how many are written here.
const NBSP = '\u00a0';

/**
 * Separates the individual contact fields from each other. The seam between the
 * contact details and the announcement is not a string at all — the ticker lays
 * its segments out with a gap of its own, so that spacing stays equal to the
 * gap before the whole thing repeats.
 */
export const CONTACT_SEPARATOR = `${NBSP.repeat(3)}•${NBSP.repeat(3)}`;

/**
 * Joins whatever contact details the profile has into one ticker line, in a
 * fixed order and skipping the blanks. All three fields are optional, so this
 * returns '' for a profile with none filled in — callers treat that the same as
 * an empty announcement and render no banner.
 */
export function formatContactDetails(profile: MasjidProfile | null | undefined): string {
  if (!profile) return '';
  return [profile.contact_number, profile.contact_email, profile.website]
    .map(value => value?.trim())
    .filter(Boolean)
    .join(CONTACT_SEPARATOR);
}

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
