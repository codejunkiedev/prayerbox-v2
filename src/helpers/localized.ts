import type { DisplayLanguage, MasjidProfile } from '@/types';

/** Profile fields that have optional `_ur` / `_ar` translations alongside them. */
type LocalizableField = 'name' | 'area';

/**
 * Picks a profile field in `lang`, falling back to the English value. Urdu and
 * Arabic translations are optional and stored as `''` rather than NULL, so a
 * blank translation means "not provided" and must fall back rather than render
 * an empty string.
 */
export function localizedProfileField(
  profile: MasjidProfile | null | undefined,
  field: LocalizableField,
  lang: DisplayLanguage
): string {
  if (!profile) return '';
  return (
    (lang === 'ur' && profile[`${field}_ur`]) ||
    (lang === 'ar' && profile[`${field}_ar`]) ||
    profile[field] ||
    ''
  );
}
