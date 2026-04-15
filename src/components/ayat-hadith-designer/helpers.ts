import { BACKGROUNDS, FONTS, type BackgroundPreset, type FontOption } from '@/constants';

export function resolveBackground(id: string): BackgroundPreset {
  return BACKGROUNDS.find(b => b.id === id) ?? BACKGROUNDS[0];
}

export function resolveFont(category: 'arabic' | 'urdu' | 'english', id: string): FontOption {
  return FONTS[category].find(f => f.id === id) ?? FONTS[category][0];
}

export function hexWithOpacity(hex: string, opacity: number): string {
  const clamped = Math.max(0, Math.min(1, opacity));
  const alpha = Math.round(clamped * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${alpha}`;
}
