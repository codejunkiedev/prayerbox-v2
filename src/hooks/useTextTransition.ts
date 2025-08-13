import { useState, useEffect, useMemo } from 'react';
import type { PrayerAdjustments, ProcessedPrayerTiming } from '@/types';

interface UseTextTransitionProps {
  prayerNames: (keyof PrayerAdjustments)[];
  processedPrayerTimings: ProcessedPrayerTiming[];
  transitionInterval?: number;
  animationDuration?: number;
}

/**
 * Custom hook to manage text transitions for Jumma prayer times
 * Cycles through multiple prayer times with smooth transitions
 * @param props Configuration object with prayer names, timings, and animation settings
 * @returns Object containing current time, animation state, and transition info
 */
export function useTextTransition({
  prayerNames,
  processedPrayerTimings,
  transitionInterval = 3000,
  animationDuration = 300,
}: UseTextTransitionProps) {
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const isJumma = prayerNames.some(name => name.startsWith('jumma'));

  const prayerTimes = useMemo(() => {
    if (!prayerNames.length) return [];
    return processedPrayerTimings
      .filter(prayer => prayerNames.includes(prayer.name))
      .map(prayer => prayer.time);
  }, [processedPrayerTimings, prayerNames]);

  useEffect(() => {
    if (!isJumma || prayerTimes.length <= 1) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentTimeIndex(prev => (prev + 1) % prayerTimes.length);
        setIsAnimating(false);
      }, animationDuration);
    }, transitionInterval);

    return () => clearInterval(interval);
  }, [isJumma, prayerTimes.length, transitionInterval, animationDuration]);

  const currentTime = prayerTimes[currentTimeIndex] || prayerTimes[0];

  return {
    currentTime,
    isAnimating,
    prayerTimes,
    hasMultipleTimes: prayerTimes.length > 1,
  };
}
