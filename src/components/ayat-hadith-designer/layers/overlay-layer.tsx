import { forwardRef } from 'react';
import { hexWithOpacity } from '@/helpers';
import { baseLayerStyle, type BoxPx } from './base';

interface OverlayLayerProps {
  box: BoxPx;
  color: string;
  opacity: number;
  outlined: boolean;
  onSelect: () => void;
}

export const OverlayLayer = forwardRef<HTMLDivElement, OverlayLayerProps>(function OverlayLayer(
  { box, color, opacity, outlined, onSelect },
  ref
) {
  return (
    <div
      ref={ref}
      onMouseDown={onSelect}
      style={{
        ...baseLayerStyle(box, outlined),
        backgroundColor: hexWithOpacity(color, opacity),
        borderRadius: 16,
      }}
    />
  );
});
