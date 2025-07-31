import { formatTimePickerTime } from '@/utils';
import type { ThemeProps } from './types';
import theme2Background from '@/assets/themes/theme-2/background.jpg';

export function Theme2({
  gregorianDate,
  hijriDate,
  sunrise,
  sunset,
  currentTime,
  processedPrayerTimings,
}: ThemeProps) {
  return (
    <div
      className='w-full h-screen bg-cover bg-center bg-no-repeat flex items-center justify-start overflow-hidden'
      style={{ backgroundImage: `url(${theme2Background})` }}
    >
      <div className='w-full sm:w-11/12 md:w-5/6 lg:w-4/5 xl:w-7/8 h-full flex flex-col lg:flex-row gap-2 sm:gap-3 md:gap-4 lg:gap-6 xl:gap-8 p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8'>
        <div className='flex flex-col items-center justify-between w-full lg:w-3/4 xl:w-2/3 py-2 sm:py-4 md:py-6 lg:py-8 xl:py-10'>
          <div className='flex flex-col sm:flex-row items-center justify-between w-full mb-4 sm:mb-0'>
            <div className='flex flex-row sm:flex-col items-center justify-center text-white space-x-4 sm:space-x-0 sm:space-y-2 md:space-y-3 lg:space-y-4 mb-4 sm:mb-0'>
              <div
                className='text-center rounded-2xl sm:rounded-3xl px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-2'
                style={{ boxShadow: '0 0 0 1px rgb(250 204 21), 0 0 0 2px rgb(251 191 36)' }}
              >
                <span className='text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-medium'>
                  Sunrise: {sunrise}
                </span>
              </div>
              <div
                className='text-center rounded-2xl sm:rounded-3xl px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-2'
                style={{ boxShadow: '0 0 0 1px rgb(250 204 21), 0 0 0 2px rgb(251 191 36)' }}
              >
                <span className='text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-medium'>
                  Sunset: {sunset}
                </span>
              </div>
            </div>
            <div>
              <div className='flex flex-col items-center justify-center text-white space-y-1'>
                <span className='text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-medium text-center'>
                  {gregorianDate}
                </span>
                <span className='text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-medium text-center'>
                  {hijriDate}
                </span>
              </div>
            </div>
          </div>
          <div className='grid grid-cols-2 grid-rows-3 gap-1 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-6 w-full'>
            {processedPrayerTimings.map(prayer => (
              <div
                key={prayer.name}
                className='flex flex-row items-center justify-between text-white px-1 py-1 sm:px-2 sm:py-2 md:px-3 md:py-3 lg:px-4 lg:py-4 xl:px-6 xl:py-6 border border-white/30 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl'
              >
                <div className='flex flex-col items-center'>
                  <span className='text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-medium'>
                    {prayer.time.split(' ')[0]}
                  </span>
                  <span className='text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg 2xl:text-xl font-medium'>
                    {prayer.time.split(' ')[1]}
                  </span>
                </div>
                <span className='text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-semibold'>
                  {prayer.arabicName}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className='flex flex-row items-center justify-center w-full lg:w-1/4 xl:w-1/3 py-4 lg:py-0'>
          <span className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-white text-center tracking-wide drop-shadow-2xl'>
            {formatTimePickerTime(currentTime)}
          </span>
        </div>
      </div>
    </div>
  );
}
