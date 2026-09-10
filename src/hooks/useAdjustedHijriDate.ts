import { useEffect, useState } from 'react';
import { addOrSubtractDays, formatHijriDate, nowInTimeZone } from '@/utils';
import { HijriCalculationMethod } from '@/constants';
import { fetchHijriDate } from '@/api/aladhan';
import type { DisplayLanguage } from '@/types';

/**
 * Props for the useAdjustedHijriDate hook
 */
interface Props {
  calculationMethod: HijriCalculationMethod;
  offset: number;
  lang?: DisplayLanguage;
  /** The masjid's IANA zone; null falls back to the device's. */
  timeZone?: string | null;
}

/**
 * Return type for the useAdjustedHijriDate hook
 */
interface ReturnType {
  adjustedHijriDate: string;
  isLoading: boolean;
}

/**
 * Custom hook to handle adjusted Hijri date
 * @param calculationMethod Hijri calculation method
 * @param offset Hijri offset
 * @returns {adjustedHijriDate, isLoading} Adjusted Hijri date and loading state
 */
export const useAdjustedHijriDate = ({
  calculationMethod = HijriCalculationMethod.Umm_al_Qura,
  offset = 0,
  lang = 'en',
  timeZone = null,
}: Props): ReturnType => {
  const [adjustedHijriDate, setAdjustedHijriDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchAdjustedDate = async () => {
      setIsLoading(true);

      try {
        const targetDate = addOrSubtractDays(nowInTimeZone(timeZone), offset);
        const response = await fetchHijriDate({
          date: targetDate,
          method: calculationMethod,
          signal: abortController.signal,
        });

        if (abortController.signal.aborted) return;

        if (response.data?.hijri) {
          const hijriData = response.data.hijri;
          const adjustedDate = formatHijriDate(hijriData, lang);
          setAdjustedHijriDate(adjustedDate);
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        console.error('Error fetching adjusted Hijri date:', error);
        setAdjustedHijriDate('');
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchAdjustedDate();

    return () => {
      abortController.abort();
    };
  }, [calculationMethod, offset, lang, timeZone]);

  return { adjustedHijriDate, isLoading };
};
