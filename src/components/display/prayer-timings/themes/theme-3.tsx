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

  const renderTimeCell = (time: string, sizeNum: string, sizeAmPm: string) => {
    const { timeNumber, amPm } = formatTimeNumber(time);
    return (
      <div className='flex items-baseline justify-center gap-[0.2vw]'>
        <span className={`${sizeNum} font-bold text-gray-800`}>{timeNumber}</span>
        <span className={`${sizeAmPm} font-medium text-gray-400 uppercase`}>{amPm}</span>
      </div>
    );
  };

  if (isPortrait) {
    return (
      <div className='w-full h-screen bg-[#f8faf9] flex flex-col overflow-hidden'>
        {/* Top bar */}
        <div className='flex-shrink-0 bg-emerald-800 px-[5vw] py-[1.8vh] flex items-center justify-between'>
          <div className='flex flex-col'>
            <span className='text-[3.2vw] font-semibold text-white/90 uppercase tracking-wide'>
              {gregorianDate}
            </span>
            <span className='text-[2.8vw] font-medium text-emerald-300'>{hijriDate}</span>
          </div>

          <CurrentTime currentTime={currentTime} variant={Theme.Theme3} orientation={orientation} />

          <div className='flex flex-col items-end gap-[0.4vh]'>
            <div className='flex items-baseline gap-[0.8vw]'>
              <span className='text-[2.2vw] text-emerald-300 uppercase font-medium'>Sunrise</span>
              <span className='text-[3vw] font-bold text-amber-400'>{sunriseNum}</span>
              <span className='text-[1.8vw] text-amber-400/80'>{sunriseAmPm}</span>
            </div>
            <div className='flex items-baseline gap-[0.8vw]'>
              <span className='text-[2.2vw] text-emerald-300 uppercase font-medium'>Sunset</span>
              <span className='text-[3vw] font-bold text-orange-400'>{sunsetNum}</span>
              <span className='text-[1.8vw] text-orange-400/80'>{sunsetAmPm}</span>
            </div>
          </div>
        </div>

        {/* Prayer table */}
        <div className='flex-1 flex flex-col min-h-0 px-[4vw] py-[1.5vh]'>
          {/* Column headers */}
          <div className='flex-shrink-0 grid grid-cols-[2.5fr_1fr_1fr_1fr] bg-emerald-700 rounded-t-xl py-[1.5vh] px-[3vw]'>
            <span className='text-[3.2vw] font-bold text-white uppercase tracking-wider'>
              Prayer
            </span>
            <span className='text-[3.2vw] font-bold text-white uppercase tracking-wider text-center'>
              Starts
            </span>
            <span className='text-[3.2vw] font-bold text-white uppercase tracking-wider text-center'>
              Athan
            </span>
            <span className='text-[3.2vw] font-bold text-white uppercase tracking-wider text-center'>
              Iqamah
            </span>
          </div>

          {/* Rows */}
          <div className='flex-1 flex flex-col rounded-b-xl overflow-hidden shadow-sm border border-t-0 border-gray-200'>
            {displayPrayers.map((prayer, index) => {
              const isNext = nextIqamah?.name === prayer.name;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={prayer.name}
                  className={`grid grid-cols-[2.5fr_1fr_1fr_1fr] flex-1 items-center px-[3vw] border-b border-gray-100 last:border-b-0 ${
                    isNext
                      ? 'bg-emerald-50 border-l-[5px] border-l-emerald-500'
                      : isEven
                        ? 'bg-white'
                        : 'bg-gray-50/70'
                  }`}
                >
                  <div className='flex items-center gap-[2vw]'>
                    <span className='text-[4vw] font-extrabold text-gray-800 uppercase'>
                      {ENGLISH_NAMES[prayer.name]}
                    </span>
                    <span className='text-[3.2vw] font-semibold text-emerald-600/70' dir='rtl'>
                      {ARABIC_NAMES[prayer.name]}
                    </span>
                  </div>
                  {renderTimeCell(prayer.starts, 'text-[4vw]', 'text-[2.2vw]')}
                  {renderTimeCell(prayer.athan, 'text-[4vw]', 'text-[2.2vw]')}
                  {renderTimeCell(prayer.iqamah, 'text-[4vw]', 'text-[2.2vw]')}
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Iqamah */}
        {nextIqamah && (
          <div className='flex-shrink-0 px-[4vw] pb-[2vh]'>
            <div className='bg-emerald-700 rounded-xl py-[2.5vh] flex items-center justify-center gap-[4vw] shadow-md'>
              <div className='flex flex-col items-center'>
                <span className='text-[2.5vw] font-bold text-emerald-200 uppercase tracking-[0.2em]'>
                  Next Iqamah
                </span>
                <span className='text-[3vw] font-semibold text-white uppercase'>
                  {ENGLISH_NAMES[nextIqamah.name]}
                </span>
              </div>
              <div className='w-[1px] h-[5vh] bg-emerald-500/50' />
              <div className='flex items-baseline gap-[1.5vw]'>
                {nextIqamah.hours > 0 && (
                  <>
                    <span className='text-[12vw] font-black text-white leading-none'>
                      {nextIqamah.hours}
                    </span>
                    <span className='text-[3.5vw] font-bold text-emerald-300 uppercase'>hr</span>
                  </>
                )}
                <span className='text-[12vw] font-black text-white leading-none'>
                  {nextIqamah.minutes}
                </span>
                <span className='text-[3.5vw] font-bold text-emerald-300 uppercase'>min</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Landscape layout
  return (
    <div className='w-full h-screen bg-[#f8faf9] flex flex-col overflow-hidden'>
      {/* Top bar */}
      <div className='flex-shrink-0 bg-emerald-800 px-[3vw] py-[1.2vh] flex items-center justify-between'>
        <div className='flex flex-col'>
          <span className='text-[1.3vw] font-semibold text-white/90 uppercase tracking-wide'>
            {gregorianDate}
          </span>
          <span className='text-[1.1vw] font-medium text-emerald-300'>{hijriDate}</span>
        </div>

        <CurrentTime currentTime={currentTime} variant={Theme.Theme3} orientation={orientation} />

        <div className='flex items-center gap-[2vw]'>
          <div className='flex items-baseline gap-[0.4vw]'>
            <span className='text-[0.9vw] text-emerald-300 uppercase font-medium'>Sunrise</span>
            <span className='text-[1.3vw] font-bold text-amber-400'>{sunriseNum}</span>
            <span className='text-[0.7vw] text-amber-400/80'>{sunriseAmPm}</span>
          </div>
          <div className='flex items-baseline gap-[0.4vw]'>
            <span className='text-[0.9vw] text-emerald-300 uppercase font-medium'>Sunset</span>
            <span className='text-[1.3vw] font-bold text-orange-400'>{sunsetNum}</span>
            <span className='text-[0.7vw] text-orange-400/80'>{sunsetAmPm}</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className='flex-1 flex flex-row px-[2.5vw] py-[1.5vh] gap-[2vw] min-h-0'>
        {/* Prayer Table */}
        <div className='flex-[3] flex flex-col min-h-0'>
          {/* Column headers */}
          <div className='flex-shrink-0 grid grid-cols-[2.5fr_1fr_1fr_1fr] bg-emerald-700 rounded-t-xl py-[1vh] px-[1.5vw]'>
            <span className='text-[1.3vw] font-bold text-white uppercase tracking-wider'>
              Prayer
            </span>
            <span className='text-[1.3vw] font-bold text-white uppercase tracking-wider text-center'>
              Starts
            </span>
            <span className='text-[1.3vw] font-bold text-white uppercase tracking-wider text-center'>
              Athan
            </span>
            <span className='text-[1.3vw] font-bold text-white uppercase tracking-wider text-center'>
              Iqamah
            </span>
          </div>

          {/* Rows */}
          <div className='flex-1 flex flex-col rounded-b-xl overflow-hidden shadow-sm border border-t-0 border-gray-200'>
            {displayPrayers.map((prayer, index) => {
              const isNext = nextIqamah?.name === prayer.name;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={prayer.name}
                  className={`grid grid-cols-[2.5fr_1fr_1fr_1fr] flex-1 items-center px-[1.5vw] border-b border-gray-100 last:border-b-0 ${
                    isNext
                      ? 'bg-emerald-50 border-l-[4px] border-l-emerald-500'
                      : isEven
                        ? 'bg-white'
                        : 'bg-gray-50/70'
                  }`}
                >
                  <div className='flex items-center gap-[0.8vw]'>
                    <span className='text-[1.7vw] font-extrabold text-gray-800 uppercase'>
                      {ENGLISH_NAMES[prayer.name]}
                    </span>
                    <span className='text-[1.3vw] font-semibold text-emerald-600/70' dir='rtl'>
                      {ARABIC_NAMES[prayer.name]}
                    </span>
                  </div>
                  {renderTimeCell(prayer.starts, 'text-[1.8vw]', 'text-[0.9vw]')}
                  {renderTimeCell(prayer.athan, 'text-[1.8vw]', 'text-[0.9vw]')}
                  {renderTimeCell(prayer.iqamah, 'text-[1.8vw]', 'text-[0.9vw]')}
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Iqamah Card */}
        {nextIqamah && (
          <div className='flex-[1] flex items-center justify-center'>
            <div className='bg-emerald-700 rounded-2xl flex flex-col items-center justify-center w-full h-[70%] px-[1vw] shadow-md'>
              <span className='text-[0.9vw] font-bold text-emerald-200 uppercase tracking-[0.2em]'>
                Next Iqamah
              </span>
              <span className='text-[1.2vw] font-semibold text-white uppercase mt-[0.3vh]'>
                {ENGLISH_NAMES[nextIqamah.name]}
              </span>
              <div className='w-[60%] h-[1px] bg-emerald-500/50 my-[1vh]' />
              <div className='flex items-baseline gap-[0.4vw]'>
                {nextIqamah.hours > 0 && (
                  <>
                    <span className='text-[4.5vw] font-black text-white leading-none'>
                      {nextIqamah.hours}
                    </span>
                    <span className='text-[1.1vw] font-bold text-emerald-300 uppercase'>hr</span>
                  </>
                )}
                <span className='text-[4.5vw] font-black text-white leading-none'>
                  {nextIqamah.minutes}
                </span>
                <span className='text-[1.1vw] font-bold text-emerald-300 uppercase'>min</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
