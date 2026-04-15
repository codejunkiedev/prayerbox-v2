import bg01 from '@/assets/backgrounds/01.jpeg';
import bg02 from '@/assets/backgrounds/02.jpeg';
import bg03 from '@/assets/backgrounds/03.jpeg';
import bg04 from '@/assets/backgrounds/04.jpeg';
import bg05 from '@/assets/backgrounds/05.jpeg';

export type BackgroundType = 'image' | 'color' | 'gradient';

export interface BackgroundPreset {
  id: string;
  type: BackgroundType;
  value: string;
  label: string;
}

export const BACKGROUNDS: BackgroundPreset[] = [
  { id: 'img-01', type: 'image', value: bg01, label: 'Image 1' },
  { id: 'img-02', type: 'image', value: bg02, label: 'Image 2' },
  { id: 'img-03', type: 'image', value: bg03, label: 'Image 3' },
  { id: 'img-04', type: 'image', value: bg04, label: 'Image 4' },
  { id: 'img-05', type: 'image', value: bg05, label: 'Image 5' },
  { id: 'color-emerald', type: 'color', value: '#064e3b', label: 'Deep Emerald' },
  { id: 'color-navy', type: 'color', value: '#0c1f3d', label: 'Navy' },
  { id: 'color-maroon', type: 'color', value: '#4a1c1c', label: 'Maroon' },
  { id: 'color-charcoal', type: 'color', value: '#1a1a1a', label: 'Charcoal' },
  { id: 'color-indigo', type: 'color', value: '#1e1b4b', label: 'Indigo' },
  { id: 'color-cream', type: 'color', value: '#fef3c7', label: 'Cream' },
  {
    id: 'grad-sunset',
    type: 'gradient',
    value: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
    label: 'Sunset',
  },
  {
    id: 'grad-ocean',
    type: 'gradient',
    value: 'linear-gradient(135deg, #0891b2 0%, #1e3a8a 100%)',
    label: 'Ocean',
  },
  {
    id: 'grad-emerald',
    type: 'gradient',
    value: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)',
    label: 'Emerald',
  },
  {
    id: 'grad-royal',
    type: 'gradient',
    value: 'linear-gradient(135deg, #7c3aed 0%, #1e1b4b 100%)',
    label: 'Royal',
  },
  {
    id: 'grad-dusk',
    type: 'gradient',
    value: 'linear-gradient(135deg, #be185d 0%, #1e1b4b 100%)',
    label: 'Dusk',
  },
  {
    id: 'grad-midnight',
    type: 'gradient',
    value: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
    label: 'Midnight',
  },
];

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

export const DEFAULT_STYLE = {
  background_id: 'img-01',
  overlay_color: '#000000',
  overlay_opacity: 0.4,
  arabic: { font_id: 'amiri', size: 72, color: '#ffffff', line_height: 1.6 },
  urdu: { font_id: 'noto-nastaliq', size: 40, color: '#ffffff', line_height: 1.8 },
  english: { font_id: 'inter', size: 36, color: '#ffffff', line_height: 1.5 },
};
