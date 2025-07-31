import { formatTimeNumber, formatTimePickerTime } from '@/utils';
import type { ThemeProps } from './types';
import theme1Background from '@/assets/themes/theme-1/background.jpg';
import fajrCard from '@/assets/themes/theme-1/fajr.png';
import duhrCard from '@/assets/themes/theme-1/duhr.png';
import asarCard from '@/assets/themes/theme-1/asar.png';
import maghribCard from '@/assets/themes/theme-1/maghrib.png';
import ishaCard from '@/assets/themes/theme-1/isha.png';
import jummaCard from '@/assets/themes/theme-1/jumma.png';
import type { PrayerAdjustments, ProcessedPrayerTiming } from '@/types';

export function Theme1({
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
      className='w-full h-screen bg-cover bg-center bg-no-repeat flex items-center justify-end overflow-hidden'
      style={{ backgroundImage: `url(${theme1Background})` }}
    >
      <div className='w-[90vw] h-full flex flex-col px-24 py-12'>
        {/* Header Section */}
        <div className='flex flex-row items-center justify-between mb-8'>
          <div className='flex flex-col items-start text-white gap-2'>
            <span className='text-2xl md:text-3xl lg:text-4xl barlow-regular'>{gregorianDate}</span>
            <span className='text-2xl md:text-3xl lg:text-4xl barlow-regular'>{hijriDate}</span>
          </div>

          <div className='flex items-baseline gap-2'>
            <span
              className='text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] font-bold ds-digi-font italic'
              style={{ color: '#E0B05C' }}
            >
              {timeNumber}
            </span>
            <span
              className='text-4xl md:text-5xl lg:text-6xl ds-digi-font italic relative top-4 md:top-5 lg:top-6'
              style={{ color: '#E0B05C' }}
            >
              {amPm}
            </span>
          </div>

          <div className='flex flex-col items-end text-white gap-2'>
            <div className='text-right'>
              <span className='text-xl md:text-2xl lg:text-3xl barlow-regular'>Sunrise: </span>
              <span
                className='text-xl md:text-2xl lg:text-3xl barlow-medium'
                style={{ color: '#E0B05C' }}
              >
                {sunrise}
              </span>
            </div>
            <div className='text-right'>
              <span className='text-xl md:text-2xl lg:text-3xl barlow-regular'>Sunset: </span>
              <span
                className='text-xl md:text-2xl lg:text-3xl barlow-medium'
                style={{ color: '#E0B05C' }}
              >
                {sunset}
              </span>
            </div>
          </div>
        </div>

        {/* Prayer Timings Grid */}
        <div className='flex-1 flex items-center justify-between'>
          <div className='grid grid-cols-2 w-[90%] mx-auto'>
            {/* Left Column */}
            <div className='flex flex-col'>
              <PrayerTimingCard
                prayerName='dhuhr'
                processedPrayerTimings={processedPrayerTimings}
                position='left'
              />
              <PrayerTimingCard
                prayerName='maghrib'
                processedPrayerTimings={processedPrayerTimings}
                position='left'
              />
              <PrayerTimingCard
                prayerName='jumma1'
                processedPrayerTimings={processedPrayerTimings}
                position='left'
              />
            </div>

            {/* Right Column */}
            <div className='flex flex-col'>
              <PrayerTimingCard
                prayerName='fajr'
                processedPrayerTimings={processedPrayerTimings}
                position='right'
              />
              <PrayerTimingCard
                prayerName='asr'
                processedPrayerTimings={processedPrayerTimings}
                position='right'
              />
              <PrayerTimingCard
                prayerName='isha'
                processedPrayerTimings={processedPrayerTimings}
                position='right'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PrayerTimingCardProps {
  prayerName: keyof PrayerAdjustments;
  processedPrayerTimings: ProcessedPrayerTiming[];
  position: 'left' | 'right';
  className?: string;
}

const getPrayerCardImage = (prayerName: keyof PrayerAdjustments) => {
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

export function PrayerTimingCard({
  prayerName,
  processedPrayerTimings,
  position,
  className = '',
}: PrayerTimingCardProps) {
  const cardImage = getPrayerCardImage(prayerName);
  const isLeftColumn = position === 'left';

  const prayerTime = processedPrayerTimings.find(prayer => prayer.name === prayerName)?.time || '';
  const { timeNumber, amPm } = formatTimeNumber(prayerTime);

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: '670px', height: '268px' }}
    >
      <img
        src={cardImage}
        alt={prayerName}
        className='absolute inset-0 object-contain'
        style={{ width: '670px', height: '268px' }}
      />
      <div
        className={`absolute inset-0 flex items-center ${
          isLeftColumn ? 'justify-end pr-16 lg:pr-20' : 'justify-start pl-16 lg:pl-20'
        }`}
      >
        <div className='flex items-baseline gap-1 lg:gap-2'>
          <span className='text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-white drop-shadow-2xl ds-digi-font'>
            {timeNumber}
          </span>
          <span className='text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl text-white drop-shadow-2xl barlow-medium relative top-3 lg:top-4 barlow-medium'>
            {amPm}
          </span>
        </div>
      </div>
    </div>
  );
}
