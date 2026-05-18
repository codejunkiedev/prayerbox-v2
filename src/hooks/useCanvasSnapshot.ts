import { useCallback } from 'react';
import { toBlob } from 'html-to-image';

export function useCanvasSnapshot() {
  return useCallback(async (node: HTMLElement): Promise<Blob> => {
    if (typeof document !== 'undefined' && 'fonts' in document) {
      try {
        await document.fonts.ready;
      } catch {
        // ignore — proceed with snapshot
      }
    }

    const blob = await toBlob(node, {
      cacheBust: true,
      pixelRatio: 1,
      style: { transform: 'none' },
    });
    if (!blob) throw new Error('Failed to capture canvas');
    return blob;
  }, []);
}
