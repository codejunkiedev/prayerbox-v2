import type { CustomThemeConfig } from '@/types';

export const DEFAULT_CUSTOM_COLOR = '#064e3b';
export const DEFAULT_GRADIENT_FROM = '#f97316';
export const DEFAULT_GRADIENT_TO = '#dc2626';
export const DEFAULT_GRADIENT_ANGLE = 135;

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
};

export interface FontOption {
  id: string;
  family: string;
  label: string;
}

export const FONTS: {
  arabic: FontOption[];
  urdu: FontOption[];
  english: FontOption[];
} = {
  arabic: [
    { id: 'amiri', family: 'Amiri, serif', label: 'Amiri' },
    { id: 'scheherazade', family: '"Scheherazade New", serif', label: 'Scheherazade New' },
    { id: 'reem-kufi', family: '"Reem Kufi", sans-serif', label: 'Reem Kufi' },
  ],
  urdu: [
    { id: 'noto-nastaliq', family: '"Noto Nastaliq Urdu", serif', label: 'Noto Nastaliq Urdu' },
    { id: 'gulzar', family: 'Gulzar, serif', label: 'Gulzar' },
  ],
  english: [
    { id: 'inter', family: 'Inter, sans-serif', label: 'Inter' },
    { id: 'playfair', family: '"Playfair Display", serif', label: 'Playfair Display' },
    { id: 'merriweather', family: 'Merriweather, serif', label: 'Merriweather' },
  ],
};

export const CANVAS_DIMENSIONS: Record<'landscape' | 'portrait' | 'mobile', [number, number]> = {
  landscape: [1920, 1080],
  portrait: [1080, 1920],
  mobile: [1080, 1920],
};

export const DEFAULT_POSITIONS = {
  overlay: { x: 10, y: 30, width: 80, height: 40 },
  arabic: { x: 15, y: 36, width: 70, height: 14 },
  urdu: { x: 15, y: 50, width: 70, height: 10 },
  english: { x: 15, y: 60, width: 70, height: 8 },
  reference: { x: 10, y: 88, width: 80, height: 6 },
};

export const DEFAULT_STYLE = {
  background: { type: 'color' as const, color: DEFAULT_CUSTOM_COLOR },
  overlay_color: '#000000',
  overlay_opacity: 0.4,
  show_overlay: true,
  arabic: {
    font_id: 'amiri',
    size: 72,
    color: '#ffffff',
    line_height: 1.6,
    align: 'center' as const,
  },
  urdu: {
    font_id: 'noto-nastaliq',
    size: 40,
    color: '#ffffff',
    line_height: 1.8,
    align: 'center' as const,
  },
  english: {
    font_id: 'inter',
    size: 36,
    color: '#ffffff',
    line_height: 1.5,
    align: 'center' as const,
  },
  reference: {
    font_id: 'inter',
    arabic_font_id: 'amiri',
    size: 28,
    color: '#ffffff',
    line_height: 1.3,
    align: 'center' as const,
  },
  positions: DEFAULT_POSITIONS,
};
