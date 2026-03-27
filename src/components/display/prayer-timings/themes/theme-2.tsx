import { cn, formatTimeNumber, getPrayerCardImage, getTimeBeforeNextPrayer } from '@/utils';
import { getFilteredJummaPrayerNames } from '@/utils';
import type { ThemeProps } from './types';
import theme2Background from '@/assets/themes/theme-2/background.jpg';
import borderSvg from '@/assets/themes/theme-2/border.svg';
import { Theme, type PrayerAdjustments, type ProcessedPrayerTiming } from '@/types';
import { useTextTransition } from '@/hooks';
import { CurrentTime } from '@/components/display/shared';
import { useMemo } from 'react';

/**
 * Prayer timing display component with Theme 2 layout - displays timings in a grid with decorative elements
 */
export function Theme2({
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

  const nextPrayer = useMemo(() => {
    return getTimeBeforeNextPrayer(processedPrayerTimings);
  }, [processedPrayerTimings]);

  if (isPortrait) {
    return (
      <div
        className='w-full h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center overflow-hidden'
        style={{ backgroundImage: `url(${theme2Background})` }}
      >
        <div className='w-full h-full flex flex-col'>
          {/* Header Section - Two columns */}
          <div className='flex-shrink-0 flex flex-row items-center justify-center gap-[8vw] py-[1.5vh]'>
            {/* Left - Current Time & Dates */}
            <div className='flex flex-col items-center'>
              <CurrentTime
                currentTime={currentTime}
                variant={Theme.Theme2}
                orientation={orientation}
              />
              <div className='flex flex-col items-center text-white'>
                <span className='text-[2.5vw] font-bold'>{gregorianDate}</span>
                <span className='text-[2.5vw] font-bold'>{hijriDate}</span>
              </div>
            </div>

            {/* Right - Sunrise, Sunset, Next Prayer */}
            <div className='flex flex-col items-end text-white gap-[0.3vh]'>
              <div className='relative text-center w-[30vw]'>
                <img
                  src={borderSvg}
                  alt='border'
                  className='absolute inset-0 w-full h-full object-contain'
                />
                <div className='relative px-3 py-1 flex items-center justify-center gap-[0.3vw]'>
                  <span className='text-[2vw] clash-display-semibold text-white'>Sunrise:</span>
                  <span className='text-[2vw] clash-display-semibold text-white lowercase'>
                    {sunrise}
                  </span>
                </div>
              </div>
              <div className='relative text-center w-[30vw]'>
                <img
                  src={borderSvg}
                  alt='border'
                  className='absolute inset-0 w-full h-full object-contain'
                />
                <div className='relative px-3 py-1 flex items-center justify-center gap-[0.3vw]'>
                  <span className='text-[2vw] clash-display-semibold text-white'>Sunset:</span>
                  <span className='text-[2vw] clash-display-semibold text-white lowercase'>
                    {sunset}
                  </span>
                </div>
              </div>
              {nextPrayer && (
                <div className='relative text-center w-[30vw]'>
                  <img
                    src={borderSvg}
                    alt='border'
                    className='absolute inset-0 w-full h-full object-contain'
                  />
                  <div className='relative px-3 py-1 flex items-center justify-center gap-[0.3vw]'>
                    <span className='text-[2vw] clash-display-semibold text-white capitalize'>
                      {nextPrayer?.name}:{' '}
                    </span>
                    <span className='text-[2vw] clash-display-semibold text-white lowercase'>
                      {nextPrayer?.timeBefore}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Prayer Timings - Single Column */}
          <div className='flex-1 flex items-center justify-center min-h-0 px-[2.5vw]'>
            <div className='flex flex-col items-center justify-evenly h-full w-full'>
              <Theme2PrayerCard
                prayerNames={['fajr']}
                processedPrayerTimings={processedPrayerTimings}
                isPortrait
              />
              <Theme2PrayerCard
                prayerNames={['dhuhr']}
                processedPrayerTimings={processedPrayerTimings}
                isPortrait
              />
              <Theme2PrayerCard
                prayerNames={['asr']}
                processedPrayerTimings={processedPrayerTimings}
                isPortrait
              />
              <Theme2PrayerCard
                prayerNames={['maghrib']}
                processedPrayerTimings={processedPrayerTimings}
                isPortrait
              />
              <Theme2PrayerCard
                prayerNames={['isha']}
                processedPrayerTimings={processedPrayerTimings}
                isPortrait
              />
              <Theme2PrayerCard
                prayerNames={getFilteredJummaPrayerNames(prayerTimeSettings)}
                processedPrayerTimings={processedPrayerTimings}
                isPortrait
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className='w-full h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center overflow-hidden'
      style={{ backgroundImage: `url(${theme2Background})` }}
    >
      <div className='w-full h-full flex flex-row'>
        {/* Left side - Prayer content */}
        <div className='w-[65vw] h-full flex flex-col px-[2.5vw]'>
          {/* Header Section */}
          <div className='flex-shrink-0 flex flex-row items-center justify-between py-[3vh]'>
            <div className='flex flex-col items-start justify-start text-white gap-[1vh]'>
              <div className='relative text-left w-[24vw]'>
                <img
                  src={borderSvg}
                  alt='border'
                  className='absolute inset-0 w-full h-full object-contain'
                />
                <div className='relative px-4 py-2 flex items-center justify-center gap-[0.5vw]'>
                  <span className='text-[2vw] clash-display-semibold text-white'>Sunrise:</span>
                  <span className='text-[2vw] clash-display-semibold text-white lowercase'>
                    {sunrise}
                  </span>
                </div>
              </div>
              <div className='relative text-left w-[24vw]'>
                <img
                  src={borderSvg}
                  alt='border'
                  className='absolute inset-0 w-full h-full object-contain'
                />
                <div className='relative px-4 py-2 flex items-center justify-center gap-[0.5vw]'>
                  <span className='text-[2vw] clash-display-semibold text-white'>Sunset: </span>
                  <span className='text-[2vw] clash-display-semibold text-white lowercase'>
                    {sunset}
                  </span>
                </div>
              </div>
              {nextPrayer && (
                <div className='relative text-left w-[24vw]'>
                  <img
                    src={borderSvg}
                    alt='border'
                    className='absolute inset-0 w-full h-full object-contain'
                  />
                  <div className='relative px-4 py-2 flex items-center justify-center gap-[0.5vw]'>
                    <span className='text-[2vw] clash-display-semibold text-white capitalize'>
                      {nextPrayer?.name} starts in:{' '}
                    </span>
                    <span className='text-[2vw] clash-display-semibold text-white lowercase'>
                      {nextPrayer?.timeBefore}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className='flex flex-col items-center text-white gap-[0.5vh]'>
              <span className='text-[1.8vw] font-bold text-center'>{gregorianDate}</span>
              <span className='text-[1.8vw] font-bold text-center'>{hijriDate}</span>
            </div>
          </div>

          {/* Prayer Timings Grid */}
          <div className='flex-1 flex items-center justify-center min-h-0'>
            <div className='grid grid-cols-2 grid-rows-3 gap-x-[2vw] w-full max-w-[70vw] h-full'>
              <Theme2PrayerCard
                prayerNames={['fajr']}
                processedPrayerTimings={processedPrayerTimings}
              />
              <Theme2PrayerCard
                prayerNames={['dhuhr']}
                processedPrayerTimings={processedPrayerTimings}
              />
              <Theme2PrayerCard
                prayerNames={['asr']}
                processedPrayerTimings={processedPrayerTimings}
              />
              <Theme2PrayerCard
                prayerNames={['maghrib']}
                processedPrayerTimings={processedPrayerTimings}
              />
              <Theme2PrayerCard
                prayerNames={['isha']}
                processedPrayerTimings={processedPrayerTimings}
              />
              <Theme2PrayerCard
                prayerNames={getFilteredJummaPrayerNames(prayerTimeSettings)}
                processedPrayerTimings={processedPrayerTimings}
              />
            </div>
          </div>
        </div>

        {/* Right side - Current Time */}
        <CurrentTime currentTime={currentTime} variant={Theme.Theme2} />
      </div>
    </div>
  );
}

interface Theme2PrayerCardProps {
  prayerNames: (keyof PrayerAdjustments)[];
  processedPrayerTimings: ProcessedPrayerTiming[];
  className?: string;
  highlight?: boolean;
  isPortrait?: boolean;
}

/**
 * Individual prayer timing card component for Theme 2 with image background and styled time display
 */
export function Theme2PrayerCard({
  prayerNames,
  processedPrayerTimings,
  className = '',
  highlight = false,
  isPortrait = false,
}: Theme2PrayerCardProps) {
  const cardImage = getPrayerCardImage(prayerNames[0], Theme.Theme2);

  const { currentTime, isAnimating, prayerTimes } = useTextTransition({
    prayerNames,
    processedPrayerTimings,
  });

  if (!prayerTimes.length) return null;

  const { timeNumber, amPm } = formatTimeNumber(currentTime);

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={isPortrait ? { width: '80vw', height: '12vh' } : { width: '30vw', height: '24vh' }}
    >
      <img
        src={cardImage}
        alt={prayerNames.join(', ')}
        className='absolute inset-0 object-contain'
        style={{ width: '100%', height: '100%' }}
      />
      <div
        className={`absolute inset-0 flex items-center ${isPortrait ? 'justify-start pl-[17vw]' : 'justify-start pl-[5vw] top-[2.5vh]'}`}
      >
        <div
          className={cn(
            `flex flex-row items-end transition-all duration-300 px-6 py-1 gap-1`,
            highlight ? 'bg-amber-600 rounded-full' : '',
            isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
          )}
        >
          <span
            className={`${isPortrait ? 'text-[7vw]' : 'text-[4vw]'} text-white drop-shadow-2xl clash-grotesk-semibold leading-none`}
          >
            {timeNumber}
          </span>
          <span
            className={`${isPortrait ? 'text-[3vw]' : 'text-[2vw]'} text-white drop-shadow-2xl clash-grotesk-semibold lowercase leading-none`}
          >
            {amPm}
          </span>
        </div>
      </div>
    </div>
  );
}
