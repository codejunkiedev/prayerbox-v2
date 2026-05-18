import type { CSSProperties } from 'react';

export interface BoxPx {
  left: number;
  top: number;
  w: number;
  h: number;
}

/**
 * Shared style applied to every draggable layer (overlay + text blocks).
 * The dashed outline is shown only when the layer is selected and we're not
 * in snapshot mode.
 */
export function baseLayerStyle(box: BoxPx, outlined: boolean): CSSProperties {
  return {
    position: 'absolute',
    left: box.left,
    top: box.top,
    width: box.w,
    height: box.h,
    outline: outlined ? '2px dashed rgba(59,130,246,0.9)' : 'none',
    outlineOffset: 2,
    cursor: 'move',
    boxSizing: 'border-box',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  };
}
