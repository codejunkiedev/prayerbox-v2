import { formatTimeNumber, getPrayerCardImage } from '@/utils';
import { getFilteredJummaPrayerNames } from '@/utils';
import type { ThemeProps } from './types';
import theme2Background from '@/assets/themes/theme-2/background.jpg';
import borderSvg from '@/assets/themes/theme-2/border.svg';
import { Theme, type PrayerAdjustments, type ProcessedPrayerTiming } from '@/types';
import { useTextTransition } from '@/hooks';
import { CurrentTime } from '@/components/display/shared';

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
}: ThemeProps) {
  return (
    <div
      className='w-full h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center overflow-hidden'
      style={{ backgroundImage: `url(${theme2Background})` }}
    >
      <div className='w-full h-full flex flex-row'>
        {/* Left side - Prayer content */}
        <div className='w-[65vw] h-full flex flex-col px-[2.5vw]'>
          {/* Header Section */}
          <div className='flex flex-row items-center justify-between py-[3vh]'>
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
            </div>

            <div className='flex flex-col items-center text-white gap-[0.5vh]'>
              <span className='text-[1.8vw] font-bold text-center'>{gregorianDate}</span>
              <span className='text-[1.8vw] font-bold text-center'>{hijriDate}</span>
            </div>
          </div>

          {/* Prayer Timings Grid */}
          <div className='flex-1 flex items-center justify-center'>
            <div className='grid grid-cols-2 grid-rows-3 gap-x-[2vw] w-full max-w-[70vw]'>
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
}

/**
 * Individual prayer timing card component for Theme 2 with image background and styled time display
 */
export function Theme2PrayerCard({
  prayerNames,
  processedPrayerTimings,
  className = '',
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
      style={{ width: '30vw', height: '24vh' }}
    >
      <img
        src={cardImage}
        alt={prayerNames.join(', ')}
        className='absolute inset-0 object-contain'
        style={{ width: '100%', height: '100%' }}
      />
      <div className='absolute inset-0 flex items-center justify-start pl-[5vw] top-[2.5vh]'>
        <div
          className={`flex flex-col items-start transition-all duration-300 ${
            isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
          }`}
        >
          <span className='text-[4vw] text-white drop-shadow-2xl clash-grotesk-semibold leading-none'>
            {timeNumber}
          </span>
          <span className='text-[2vw] text-white drop-shadow-2xl self-center clash-grotesk-semibold lowercase leading-none'>
            {amPm}
          </span>
        </div>
      </div>
    </div>
  );
}
