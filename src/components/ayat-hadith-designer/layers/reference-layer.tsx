import { forwardRef } from 'react';
import type { AyatHadithAlign } from '@/types';
import { baseLayerStyle, type BoxPx } from './base';

interface ReferenceLayerProps {
  box: BoxPx;
  arabic: string;
  english: string;
  arabicFontFamily: string;
  englishFontFamily: string;
  size: number;
  color: string;
  lineHeight: number;
  align: AyatHadithAlign;
  outlined: boolean;
  onSelect: () => void;
}

export const ReferenceLayer = forwardRef<HTMLDivElement, ReferenceLayerProps>(
  function ReferenceLayer(
    {
      box,
      arabic,
      english,
      arabicFontFamily,
      englishFontFamily,
      size,
      color,
      lineHeight,
      align,
      outlined,
      onSelect,
    },
    ref
  ) {
    const justifyContent =
      align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';

    return (
      <div
        ref={ref}
        onMouseDown={onSelect}
        style={{
          ...baseLayerStyle(box, outlined),
          display: 'flex',
          alignItems: 'center',
          justifyContent,
          textAlign: align,
          fontSize: size,
          color,
          lineHeight,
          overflow: 'hidden',
          padding: '0.5% 1%',
        }}
      >
        <span dir='rtl' style={{ fontFamily: arabicFontFamily }}>
          {arabic}
        </span>
        <span style={{ margin: '0 0.4em' }}>-</span>
        <span dir='ltr' style={{ fontFamily: englishFontFamily }}>
          {english}
        </span>
      </div>
    );
  }
);
