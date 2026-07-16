import { FONTS, type FontOption } from '@/constants';

export function resolveFont(category: 'arabic' | 'urdu' | 'english', id: string): FontOption {
  return FONTS[category].find(f => f.id === id) ?? FONTS[category][0];
}

const FONT_CATEGORIES = ['english', 'arabic', 'urdu'] as const;

/**
 * Resolves a font id without knowing its script — for text whose language is
 * the admin's free choice rather than the screen's, so there is no category to
 * look it up under. Ids are unique across categories.
 */
export function resolveFontById(id: string): FontOption {
  for (const category of FONT_CATEGORIES) {
    const match = FONTS[category].find(f => f.id === id);
    if (match) return match;
  }
  return FONTS.english[0];
}
