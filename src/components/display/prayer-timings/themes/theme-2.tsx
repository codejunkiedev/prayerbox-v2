import { formatTimePickerTime } from '@/utils';
import type { ThemeProps } from './types';
import theme2Background from '@/assets/themes/backgrounds/theme-2.jpg';

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
      <div className='w-7/8 h-full flex flex-row gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 py-1 pl-1 sm:py-2 sm:pl-2 md:py-4 md:pl-4 lg:py-8 lg:pl-12 xl:py-10 xl:pl-16'>
        <div className='flex flex-col items-center justify-between w-2/3 py-10'>
          <div className='flex flex-row items-center justify-between w-full'>
            <div className='flex flex-col items-center justify-center text-white space-y-4 mb-4'>
              <div
                className='w-70 text-center rounded-3xl px-4 py-2'
                style={{ boxShadow: '0 0 0 1px rgb(250 204 21), 0 0 0 2px rgb(251 191 36)' }}
              >
                <span className='text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-medium'>
                  Sunrise:{' '}
                </span>
                <span className='text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-medium'>
                  {sunrise}
                </span>
              </div>
              <div
                className='w-70 text-center rounded-3xl px-4 py-2'
                style={{ boxShadow: '0 0 0 1px rgb(250 204 21), 0 0 0 2px rgb(251 191 36)' }}
              >
                <span className='text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-medium'>
                  Sunset:{' '}
                </span>
                <span className='text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-medium'>
                  {sunset}
                </span>
              </div>
            </div>
            <div>
              <div className='flex flex-col items-center justify-center text-white space-y-1'>
                <span className='text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-medium text-center'>
                  {gregorianDate}
                </span>
                <span className='text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-medium text-center'>
                  {hijriDate}
                </span>
              </div>
            </div>
          </div>
          <div className='grid grid-cols-2 grid-rows-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6 xl:gap-8 w-full max-w-[95%]'>
            {processedPrayerTimings.map(prayer => (
              <div
                key={prayer.name}
                className='flex flex-row items-center justify-between text-white px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4 lg:px-6 lg:py-6 xl:px-8 xl:py-8 border border-white/30 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl'
              >
                <div className='flex flex-col items-center'>
                  <span className='text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-medium'>
                    {prayer.time.split(' ')[0]}
                  </span>
                  <span className='text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl font-medium'>
                    {prayer.time.split(' ')[1]}
                  </span>
                </div>
                <span className='text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-semibold'>
                  {prayer.arabicName}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className='flex flex-row items-center justify-center w-1/3'>
          <span className='text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-white text-center tracking-wide drop-shadow-2xl'>
            {formatTimePickerTime(currentTime)}
          </span>
        </div>
      </div>
    </div>
  );
}
