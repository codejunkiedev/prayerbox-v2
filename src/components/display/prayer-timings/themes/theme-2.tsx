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
      <div className='w-5/6 h-full flex flex-row py-1 pl-1 sm:py-2 sm:pl-2 md:py-4 md:pl-4 lg:py-8 lg:pl-12 xl:py-10 xl:pl-16'>
        <div className='flex flex-col items-center justify-between flex-3 py-10'>
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
          <div className='grid grid-cols-2 grid-rows-3 gap-4 w-full max-w-4xl'>
            {processedPrayerTimings.map(prayer => (
              <div
                key={prayer.name}
                className='flex flex-row items-center justify-between text-white px-6 py-4 border border-white/30 rounded-xl'
              >
                <div className='flex flex-col items-center'>
                  <span className='text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-medium'>
                    {prayer.time.split(' ')[0]}
                  </span>
                  <span className='text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-medium'>
                    {prayer.time.split(' ')[1]}
                  </span>
                </div>
                <span className='text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold'>
                  {prayer.arabicName}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className='flex flex-row items-center justify-center flex-1'>
          <span className='text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-white text-center tracking-wide drop-shadow-2xl'>
            {formatTimePickerTime(currentTime)}
          </span>
        </div>
      </div>
    </div>
  );
}
