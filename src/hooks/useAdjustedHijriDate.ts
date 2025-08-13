import { useEffect, useState } from 'react';
import { addOrSubtractDays, formatHijriDate } from '@/utils';
import type { Settings } from '@/types';
import { HijriCalculationMethod } from '@/constants';
import { fetchHijriDate } from '@/api/aladhan';

interface ReturnType {
  adjustedHijriDate: string;
  isLoading: boolean;
}

/**
 * Custom hook to handle adjusted Hijri date
 * @param userSettings User settings
 * @param baseDate Base date to calculate from (default: today)
 * @returns {adjustedHijriDate, isLoading} Adjusted Hijri date and loading state
 */
export const useAdjustedHijriDate = (
  userSettings: Settings | null,
  baseDate = new Date()
): ReturnType => {
  const [adjustedHijriDate, setAdjustedHijriDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAdjustedDate = async () => {
      if (!userSettings) return;

      setIsLoading(true);

      try {
        const calculationMethod =
          userSettings.hijri_calculation_method || HijriCalculationMethod.Umm_al_Qura;
        const offset = userSettings.hijri_offset || 0;

        const targetDate = addOrSubtractDays(baseDate, offset);
        const response = await fetchHijriDate({ date: targetDate, method: calculationMethod });

        if (response.data?.hijri) {
          const hijriData = response.data.hijri;
          const adjustedDate = formatHijriDate(hijriData);
          setAdjustedHijriDate(adjustedDate);
        }
      } catch (error) {
        console.error('Error fetching adjusted Hijri date:', error);
        setAdjustedHijriDate('');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdjustedDate();
  }, [baseDate, userSettings]);

  return { adjustedHijriDate, isLoading };
};
