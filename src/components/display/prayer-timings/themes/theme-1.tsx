import { formatTimePickerTime } from '@/utils';
import type { ThemeProps } from './types';
import theme1Background from '@/assets/themes/backgrounds/theme-1.jpg';

export function Theme1({ gregorianDate, hijriDate, sunrise, sunset, currentTime }: ThemeProps) {
  return (
    <div
      className='w-full h-full bg-cover bg-center bg-no-repeat flex flex-col pl-62 pr-16 py-12'
      style={{ backgroundImage: `url(${theme1Background})` }}
    >
      {/* Top Row */}
      <div className='flex flex-row items-center justify-between mb-8'>
        {/* Left side - Dates */}
        <div className='flex flex-col items-start justify-center text-white'>
          <span className='text-xl font-medium mb-1'>{gregorianDate}</span>
          <span className='text-lg font-normal opacity-90'>{hijriDate}</span>
        </div>

        {/* Center - Current Time */}
        <div className='flex flex-col items-center justify-center'>
          <span className='text-6xl font-bold text-yellow-400 tracking-wide'>
            {formatTimePickerTime(currentTime)}
          </span>
        </div>

        {/* Right side - Sunrise/Sunset */}
        <div className='flex flex-col items-end justify-center text-white space-y-1'>
          <div className='text-right'>
            <span className='text-lg font-medium'>Sunrise: </span>
            <span className='text-lg font-bold text-yellow-400'>{sunrise}</span>
          </div>
          <div className='text-right'>
            <span className='text-lg font-medium'>Sunset: </span>
            <span className='text-lg font-bold text-yellow-400'>{sunset}</span>
          </div>
        </div>
      </div>

      {/* Prayer times section will go here */}
      <div className='flex-1'>{/* TODO: Implement prayer times display */}</div>
    </div>
  );
}
