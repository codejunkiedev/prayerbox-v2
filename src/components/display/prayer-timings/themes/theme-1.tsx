import { formatTimePickerTime } from '@/utils';
import type { ThemeProps } from './types';
import theme1Background from '@/assets/themes/backgrounds/theme-1.jpg';

export function Theme1({
  gregorianDate,
  hijriDate,
  sunrise,
  sunset,
  currentTime,
  processedPrayerTimings,
}: ThemeProps) {
  return (
    <div
      className='w-full h-screen bg-cover bg-center bg-no-repeat flex items-center justify-end overflow-hidden'
      style={{ backgroundImage: `url(${theme1Background})` }}
    >
      <div className='w-5/6 h-full flex flex-col py-1 pr-1 sm:py-2 sm:pr-2 md:py-4 md:pr-4 lg:py-8 lg:pr-12 xl:py-10 xl:pr-16'>
        <div className='relative flex flex-row items-center justify-between mb-1 sm:mb-2 md:mb-4 lg:mb-8 xl:mb-10'>
          <div className='flex flex-col items-start justify-center text-white z-10'>
            <span className='text-xs sm:text-sm md:text-base lg:text-xl xl:text-2xl font-medium mb-1'>
              {gregorianDate}
            </span>
            <span className='text-xs sm:text-sm md:text-base lg:text-xl xl:text-2xl font-medium'>
              {hijriDate}
            </span>
          </div>

          <div className='absolute left-1/2 top-10 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center'>
            <span className='text-lg sm:text-xl md:text-3xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-yellow-400 tracking-wide'>
              {formatTimePickerTime(currentTime)}
            </span>
          </div>

          <div className='flex flex-col items-end justify-center text-white space-y-1 z-10'>
            <div className='text-right'>
              <span className='text-xs sm:text-sm md:text-base lg:text-xl xl:text-2xl font-medium'>
                Sunrise:{' '}
              </span>
              <span className='text-xs sm:text-sm md:text-base lg:text-xl xl:text-2xl font-medium text-yellow-400'>
                {sunrise}
              </span>
            </div>
            <div className='text-right'>
              <span className='text-xs sm:text-sm md:text-base lg:text-xl xl:text-2xl font-medium'>
                Sunset:{' '}
              </span>
              <span className='text-xs sm:text-sm md:text-base lg:text-xl xl:text-2xl font-medium text-yellow-400'>
                {sunset}
              </span>
            </div>
          </div>
        </div>

        <div className='flex-1 flex items-center justify-center min-h-0'>
          <div className='p-0.5 sm:p-1 md:p-2 lg:p-6 xl:p-8 w-full max-w-[95%]'>
            <div className='grid grid-cols-2 grid-rows-3 gap-0.5 sm:gap-1 md:gap-2 lg:gap-6 xl:gap-8 h-full'>
              {processedPrayerTimings.map((prayer, index) => {
                const isLeftColumn = index % 2 === 0;
                const timeParts = prayer.time.split(' ');
                const timeNumber = timeParts[0];
                const amPm = timeParts[1];

                return (
                  <div
                    key={prayer.name}
                    className={`flex items-center rounded-md sm:rounded-lg md:rounded-xl lg:rounded-2xl border border-yellow-400 p-0.5 sm:p-1 md:p-2 lg:p-6 xl:p-8 gap-0.5 sm:gap-1 md:gap-2 lg:gap-4 xl:gap-6 min-h-0 ${
                      isLeftColumn ? 'flex-row' : 'flex-row-reverse'
                    }`}
                  >
                    <div className='text-white text-[8px] xs:text-xs sm:text-sm md:text-lg lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold flex-1 text-center'>
                      {prayer.arabicName}
                    </div>
                    <div className='text-yellow-400 flex-1 text-center flex items-baseline justify-center gap-0.5'>
                      <span className='text-[8px] xs:text-xs sm:text-sm md:text-lg lg:text-3xl xl:text-4xl 2xl:text-5xl font-semibold'>
                        {timeNumber}
                      </span>
                      <span className='text-[6px] xs:text-[8px] sm:text-xs md:text-sm lg:text-xl xl:text-2xl 2xl:text-3xl font-medium'>
                        {amPm}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
