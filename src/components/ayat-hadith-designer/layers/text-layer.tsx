import { forwardRef } from 'react';
import type { AyatHadithAlign } from '@/types';
import { baseLayerStyle, type BoxPx } from './base';

interface TextLayerProps {
  box: BoxPx;
  text: string;
  dir: 'rtl' | 'ltr';
  fontFamily: string;
  size: number;
  color: string;
  lineHeight: number;
  align: AyatHadithAlign;
  fontWeight?: number;
  outlined: boolean;
  onSelect: () => void;
}

export const TextLayer = forwardRef<HTMLDivElement, TextLayerProps>(function TextLayer(
  { box, text, dir, fontFamily, size, color, lineHeight, align, fontWeight, outlined, onSelect },
  ref
) {
  const justifyContent =
    align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';

  return (
    <div
      ref={ref}
      dir={dir}
      onMouseDown={onSelect}
      style={{
        ...baseLayerStyle(box, outlined),
        display: 'flex',
        alignItems: 'center',
        justifyContent,
        textAlign: align,
        padding: '0.5% 1%',
        fontFamily,
        fontSize: size,
        color,
        lineHeight,
        fontWeight,
        overflow: 'hidden',
        whiteSpace: 'normal',
        wordBreak: 'break-word',
      }}
    >
      {text}
    </div>
  );
});
