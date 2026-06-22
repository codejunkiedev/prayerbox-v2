import { FONTS, type FontOption } from '@/constants';

export function resolveFont(category: 'arabic' | 'urdu' | 'english', id: string): FontOption {
  return FONTS[category].find(f => f.id === id) ?? FONTS[category][0];
}
