import { useEffect, useState } from 'react';
import type { ScreenOrientation } from '@/types';

type OrientationMismatchResult = {
  mismatch: boolean;
  expected: ScreenOrientation | null;
  actual: ScreenOrientation | null;
};

export function useOrientationMismatch(
  screenOrientation?: ScreenOrientation
): OrientationMismatchResult {
  const [result, setResult] = useState<OrientationMismatchResult>({
    mismatch: false,
    expected: null,
    actual: null,
  });

  useEffect(() => {
    if (!screenOrientation) return;

    const check = () => {
      const isMonitorPortrait = window.innerHeight > window.innerWidth;
      const isScreenPortrait = screenOrientation === 'portrait' || screenOrientation === 'mobile';
      setResult({
        mismatch: isMonitorPortrait !== isScreenPortrait,
        expected: isScreenPortrait ? 'portrait' : 'landscape',
        actual: isMonitorPortrait ? 'portrait' : 'landscape',
      });
    };

    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [screenOrientation]);

  return result;
}
