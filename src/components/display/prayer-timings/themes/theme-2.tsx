import { formatTimeNumber, formatTimePickerTime } from '@/utils';
import type { ThemeProps } from './types';
import theme2Background from '@/assets/themes/theme-2/background.jpg';
import borderSvg from '@/assets/themes/theme-2/border.svg';
import fajrCard from '@/assets/themes/theme-2/fajr.png';
import duhrCard from '@/assets/themes/theme-2/duhr.png';
import asarCard from '@/assets/themes/theme-2/asar.png';
import maghribCard from '@/assets/themes/theme-2/maghrib.png';
import ishaCard from '@/assets/themes/theme-2/isha.png';
import jummaCard from '@/assets/themes/theme-2/jumma.png';
import type { PrayerAdjustments, ProcessedPrayerTiming } from '@/types';

export function Theme2({
  gregorianDate,
  hijriDate,
  sunrise,
  sunset,
  currentTime,
  processedPrayerTimings,
}: ThemeProps) {
  const { timeNumber, amPm } = formatTimeNumber(formatTimePickerTime(currentTime));

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
              <Theme2PrayerCard prayerName='fajr' processedPrayerTimings={processedPrayerTimings} />
              <Theme2PrayerCard
                prayerName='dhuhr'
                processedPrayerTimings={processedPrayerTimings}
              />
              <Theme2PrayerCard prayerName='asr' processedPrayerTimings={processedPrayerTimings} />
              <Theme2PrayerCard
                prayerName='maghrib'
                processedPrayerTimings={processedPrayerTimings}
              />
              <Theme2PrayerCard prayerName='isha' processedPrayerTimings={processedPrayerTimings} />
              <Theme2PrayerCard
                prayerName='jumma1'
                processedPrayerTimings={processedPrayerTimings}
              />
            </div>
          </div>
        </div>

        {/* Right side - Current Time */}
        <div className='w-[20vw] h-full flex items-center justify-center'>
          <div className='flex flex-col items-center justify-center'>
            <span className='text-[8vw] text-white drop-shadow-lg clash-display-bold leading-none'>
              {timeNumber}
            </span>
            <span className='text-[4vw] text-white drop-shadow-lg clash-display-medium lowercase leading-none'>
              {amPm}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Theme2PrayerCardProps {
  prayerName: keyof PrayerAdjustments;
  processedPrayerTimings: ProcessedPrayerTiming[];
  className?: string;
}

const getTheme2PrayerCardImage = (prayerName: keyof PrayerAdjustments) => {
  switch (prayerName) {
    case 'fajr':
      return fajrCard;
    case 'dhuhr':
      return duhrCard;
    case 'asr':
      return asarCard;
    case 'maghrib':
      return maghribCard;
    case 'isha':
      return ishaCard;
    case 'jumma1':
      return jummaCard;
    default:
      return fajrCard;
  }
};

export function Theme2PrayerCard({
  prayerName,
  processedPrayerTimings,
  className = '',
}: Theme2PrayerCardProps) {
  const cardImage = getTheme2PrayerCardImage(prayerName);

  const prayerTime = processedPrayerTimings.find(prayer => prayer.name === prayerName)?.time || '';
  const { timeNumber, amPm } = formatTimeNumber(prayerTime);

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: '30vw', height: '24vh' }}
    >
      <img
        src={cardImage}
        alt={prayerName}
        className='absolute inset-0 object-contain'
        style={{ width: '100%', height: '100%' }}
      />
      <div className='absolute inset-0 flex items-center justify-start pl-[5vw] top-[2.5vh]'>
        <div className='flex flex-col items-start'>
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
