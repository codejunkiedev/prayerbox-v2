import {
  getTimeBeforeNextIqamah,
  getFilteredJummaPrayerNames,
  isFridayPrayer,
  formatTimeNumber,
} from '@/utils';
import type { ThemeProps } from './types';
import { Theme, type PrayerAdjustments, type ProcessedPrayerTiming } from '@/types';
import { CurrentTime } from '@/components/display/shared';
import { useMemo } from 'react';

const ARABIC_NAMES: Record<string, string> = {
  fajr: 'الفجر',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
  jumma1: 'الجمعة',
  jumma2: 'الجمعة',
  jumma3: 'الجمعة',
};

const ENGLISH_NAMES: Record<string, string> = {
  fajr: 'FAJR',
  dhuhr: 'DHUHR',
  asr: 'ASR',
  maghrib: 'MAGHRIB',
  isha: 'ISHA',
  jumma1: 'JUMMA 1',
  jumma2: 'JUMMA 2',
  jumma3: 'JUMMA 3',
};

export function Theme3({
  gregorianDate,
  hijriDate,
  sunrise,
  sunset,
  currentTime,
  processedPrayerTimings,
  prayerTimeSettings,
  orientation,
}: ThemeProps) {
  const isPortrait = orientation === 'portrait';

  const nextIqamah = useMemo(() => {
    return getTimeBeforeNextIqamah(processedPrayerTimings);
  }, [processedPrayerTimings]);

  const isFriday = useMemo(() => {
    return isFridayPrayer(undefined);
  }, []);

  const displayPrayers = useMemo(() => {
    const base: (keyof PrayerAdjustments)[] = ['fajr'];

    if (isFriday) {
      const jummaNames = getFilteredJummaPrayerNames(prayerTimeSettings);
      base.push(...jummaNames);
    } else {
      base.push('dhuhr');
    }

    base.push('asr', 'maghrib', 'isha');

    return base
      .map(name => processedPrayerTimings.find(p => p.name === name))
      .filter((p): p is ProcessedPrayerTiming => !!p);
  }, [processedPrayerTimings, prayerTimeSettings, isFriday]);

  const { sunriseNum, sunriseAmPm } = useMemo(() => {
    const parsed = formatTimeNumber(sunrise);
    return { sunriseNum: parsed.timeNumber, sunriseAmPm: parsed.amPm };
  }, [sunrise]);

  const { sunsetNum, sunsetAmPm } = useMemo(() => {
    const parsed = formatTimeNumber(sunset);
    return { sunsetNum: parsed.timeNumber, sunsetAmPm: parsed.amPm };
  }, [sunset]);

  const renderTimeCell = (time: string, size: string) => {
    const { timeNumber, amPm } = formatTimeNumber(time);
    return (
      <div className='flex items-baseline justify-center gap-[0.2vw]'>
        <span className={`${size} font-bold text-gray-800`}>{timeNumber}</span>
        <span
          className={`${isPortrait ? 'text-[1.8vw]' : 'text-[0.9vw]'} font-semibold text-gray-500 uppercase`}
        >
          {amPm}
        </span>
      </div>
    );
  };

  const tableTimeFontSize = isPortrait ? 'text-[3.2vw]' : 'text-[1.8vw]';
  const headerFontSize = isPortrait ? 'text-[2.8vw]' : 'text-[1.4vw]';
  const prayerNameSize = isPortrait ? 'text-[3vw]' : 'text-[1.6vw]';
  const arabicNameSize = isPortrait ? 'text-[2.8vw]' : 'text-[1.4vw]';

  return (
    <div className='w-full h-screen bg-gradient-to-b from-white via-emerald-50/30 to-white flex flex-col overflow-hidden'>
      {/* Header */}
      <div
        className={`flex-shrink-0 flex items-center justify-between ${isPortrait ? 'px-[4vw] pt-[2vh]' : 'px-[3vw] pt-[1.5vh]'}`}
      >
        {/* Dates */}
        <div className='flex flex-col items-start'>
          <span
            className={`${isPortrait ? 'text-[2.5vw]' : 'text-[1.3vw]'} font-semibold text-gray-700 uppercase tracking-wide`}
          >
            {gregorianDate}
          </span>
          <span
            className={`${isPortrait ? 'text-[2.2vw]' : 'text-[1.1vw]'} font-medium text-emerald-700`}
          >
            {hijriDate}
          </span>
        </div>

        {/* Current Time */}
        <CurrentTime currentTime={currentTime} variant={Theme.Theme3} orientation={orientation} />

        {/* Sunrise & Sunset */}
        <div className='flex flex-col items-end gap-[0.3vh]'>
          <div className='flex items-center gap-[0.5vw]'>
            <span
              className={`${isPortrait ? 'text-[2vw]' : 'text-[1vw]'} font-semibold text-gray-500 uppercase tracking-wider`}
            >
              Sunrise
            </span>
            <div className='flex items-baseline gap-[0.15vw]'>
              <span
                className={`${isPortrait ? 'text-[2.5vw]' : 'text-[1.3vw]'} font-bold text-amber-600`}
              >
                {sunriseNum}
              </span>
              <span
                className={`${isPortrait ? 'text-[1.5vw]' : 'text-[0.8vw]'} font-semibold text-amber-500 uppercase`}
              >
                {sunriseAmPm}
              </span>
            </div>
          </div>
          <div className='flex items-center gap-[0.5vw]'>
            <span
              className={`${isPortrait ? 'text-[2vw]' : 'text-[1vw]'} font-semibold text-gray-500 uppercase tracking-wider`}
            >
              Sunset
            </span>
            <div className='flex items-baseline gap-[0.15vw]'>
              <span
                className={`${isPortrait ? 'text-[2.5vw]' : 'text-[1.3vw]'} font-bold text-orange-600`}
              >
                {sunsetNum}
              </span>
              <span
                className={`${isPortrait ? 'text-[1.5vw]' : 'text-[0.8vw]'} font-semibold text-orange-500 uppercase`}
              >
                {sunsetAmPm}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className={`${isPortrait ? 'mx-[4vw] my-[1vh]' : 'mx-[3vw] my-[0.8vh]'}`}>
        <div className='h-[2px] bg-gradient-to-r from-transparent via-emerald-300 to-transparent' />
      </div>

      {/* Main content: Table + Next Iqamah */}
      <div
        className={`flex-1 flex ${isPortrait ? 'flex-col px-[4vw] gap-[2vh]' : 'flex-row px-[3vw] gap-[2vw]'} min-h-0`}
      >
        {/* Prayer Table */}
        <div className={`${isPortrait ? 'flex-1' : 'flex-[3]'} flex flex-col min-h-0`}>
          {/* Table Header */}
          <div
            className={`grid ${isPortrait ? 'grid-cols-[2fr_1fr_1fr_1fr]' : 'grid-cols-[2fr_1fr_1fr_1fr]'} bg-emerald-700 rounded-t-lg ${isPortrait ? 'py-[1vh]' : 'py-[0.8vh]'}`}
          >
            <div
              className={`${headerFontSize} font-bold text-white uppercase tracking-wider pl-[1.5vw]`}
            >
              Prayer
            </div>
            <div
              className={`${headerFontSize} font-bold text-white uppercase tracking-wider text-center`}
            >
              Starts
            </div>
            <div
              className={`${headerFontSize} font-bold text-white uppercase tracking-wider text-center`}
            >
              Athan
            </div>
            <div
              className={`${headerFontSize} font-bold text-white uppercase tracking-wider text-center`}
            >
              Iqamah
            </div>
          </div>

          {/* Prayer Rows */}
          <div className='flex-1 flex flex-col'>
            {displayPrayers.map((prayer, index) => {
              const isNext = nextIqamah?.name === prayer.name;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={prayer.name}
                  className={`grid grid-cols-[2fr_1fr_1fr_1fr] flex-1 items-center transition-colors ${
                    isNext
                      ? 'bg-emerald-100 border-l-[4px] border-l-emerald-600'
                      : isEven
                        ? 'bg-emerald-50/60'
                        : 'bg-white'
                  }`}
                >
                  {/* Prayer Name */}
                  <div className={`flex items-center gap-[0.8vw] pl-[1.5vw]`}>
                    <span
                      className={`${prayerNameSize} font-extrabold text-gray-800 uppercase tracking-wide`}
                    >
                      {ENGLISH_NAMES[prayer.name] || prayer.name}
                    </span>
                    <span className={`${arabicNameSize} font-bold text-emerald-700`} dir='rtl'>
                      {ARABIC_NAMES[prayer.name] || prayer.arabicName}
                    </span>
                  </div>

                  {/* Starts */}
                  <div className='flex items-center justify-center'>
                    {renderTimeCell(prayer.starts, tableTimeFontSize)}
                  </div>

                  {/* Athan */}
                  <div className='flex items-center justify-center'>
                    {renderTimeCell(prayer.athan, tableTimeFontSize)}
                  </div>

                  {/* Iqamah */}
                  <div className='flex items-center justify-center'>
                    {renderTimeCell(prayer.iqamah, tableTimeFontSize)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Iqamah Card */}
        {nextIqamah && (
          <div
            className={`${isPortrait ? 'flex-shrink-0' : 'flex-[1] flex items-center justify-center'}`}
          >
            <div
              className={`bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl flex flex-col items-center justify-center ${
                isPortrait ? 'py-[2vh] px-[4vw]' : 'w-full h-[60%] px-[1vw]'
              } shadow-lg`}
            >
              <span
                className={`${isPortrait ? 'text-[2.2vw]' : 'text-[1.1vw]'} font-bold text-emerald-100 uppercase tracking-widest`}
              >
                Next Iqamah In
              </span>
              <div className='flex items-baseline gap-[0.5vw] mt-[0.5vh]'>
                {nextIqamah.hours > 0 && (
                  <>
                    <span
                      className={`${isPortrait ? 'text-[8vw]' : 'text-[4vw]'} font-black text-white leading-none`}
                    >
                      {nextIqamah.hours}
                    </span>
                    <span
                      className={`${isPortrait ? 'text-[2.5vw]' : 'text-[1.2vw]'} font-bold text-emerald-200 uppercase`}
                    >
                      hr
                    </span>
                  </>
                )}
                <span
                  className={`${isPortrait ? 'text-[8vw]' : 'text-[4vw]'} font-black text-white leading-none`}
                >
                  {nextIqamah.minutes}
                </span>
                <span
                  className={`${isPortrait ? 'text-[2.5vw]' : 'text-[1.2vw]'} font-bold text-emerald-200 uppercase`}
                >
                  min
                </span>
              </div>
              <span
                className={`${isPortrait ? 'text-[2vw]' : 'text-[1vw]'} font-semibold text-emerald-200 uppercase tracking-wider mt-[0.3vh]`}
              >
                {ENGLISH_NAMES[nextIqamah.name] || nextIqamah.name}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom accent line */}
      <div className='flex-shrink-0 h-[0.5vh] bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600' />
    </div>
  );
}
