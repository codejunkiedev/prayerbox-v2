import type { DisplayLanguage } from '@/types';

const LOCALES: Record<DisplayLanguage, string> = {
  en: 'en-US',
  ur: 'ur-PK',
  ar: 'ar-SA',
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
 * Formats a number for display. Digits are always rendered in Latin script
 * (0-9) regardless of language — Urdu/Arabic screens keep Western numerals so
 * temperatures, percentages, and times stay legible to all viewers. Accepts
 * strings so callers can pass pre-formatted values (e.g. "85%") and only the
 * digits inside are normalized.
 */
export function formatNumber(value: number | string, lang: DisplayLanguage): string {
  const formatter = new Intl.NumberFormat(getLocale(lang), {
    useGrouping: false,
    numberingSystem: 'latn',
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
