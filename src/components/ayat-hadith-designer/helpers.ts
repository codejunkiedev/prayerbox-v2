import type { CSSProperties } from 'react';
import { FONTS, type FontOption } from '@/constants';
import type { AyatHadithBackground } from '@/types';

export function gradientCss(from: string, to: string, angle: number): string {
  return `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%)`;
}

export function backgroundCss(bg: AyatHadithBackground): CSSProperties {
  if (bg.type === 'image') {
    return {
      backgroundImage: `url(${bg.url})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  if (bg.type === 'gradient') {
    return { backgroundImage: gradientCss(bg.from, bg.to, bg.angle) };
  }
  return { backgroundColor: bg.color };
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
