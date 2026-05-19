import type { DisplayLanguage } from '@/types';

const LOCALES: Record<DisplayLanguage, string> = {
  en: 'en-US',
  ur: 'ur-PK',
  ar: 'ar-SA',
};

// V8/ICU defaults `ur-PK` and `ar-SA` to Latin digits, so we pin the
// numbering system explicitly. `arabext` → ۰۱۲۳۴۵۶۷۸۹ (Urdu / Persian),
// `arab` → ٠١٢٣٤٥٦٧٨٩ (Arabic).
const NUMBERING_SYSTEM: Record<DisplayLanguage, string | undefined> = {
  en: undefined,
  ur: 'arabext',
  ar: 'arab',
};

/** BCP-47 locale tag for a display language. Used by Intl formatters. */
export function getLocale(lang: DisplayLanguage): string {
  return LOCALES[lang];
}

/** Text direction for a display language — RTL for Urdu/Arabic. */
export function getDir(lang: DisplayLanguage): 'ltr' | 'rtl' {
  return lang === 'en' ? 'ltr' : 'rtl';
}

/**
 * Localizes a number into the script appropriate for the language. Accepts
 * strings so callers can pass pre-formatted values (e.g. "85%") and only the
 * digits inside are transformed.
 */
export function formatNumber(value: number | string, lang: DisplayLanguage): string {
  const locale = getLocale(lang);
  const numberingSystem = NUMBERING_SYSTEM[lang];
  const formatter = new Intl.NumberFormat(locale, {
    useGrouping: false,
    ...(numberingSystem ? { numberingSystem } : {}),
  });

  if (typeof value === 'number') return formatter.format(value);
  return value.replace(/\d/g, digit => formatter.format(Number(digit)));
}

/**
 * CSS class that loads a script-appropriate font. Maps to fonts already
 * imported by the ayat/hadith designer; reusing them avoids extra bundle
 * weight. English stays on the default body font.
 */
export function getFontClass(lang: DisplayLanguage): string {
  switch (lang) {
    case 'ur':
      return 'font-urdu';
    case 'ar':
      return 'font-arabic';
    default:
      return '';
  }
}
