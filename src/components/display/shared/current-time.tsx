import { Theme, type ScreenOrientation } from '@/types';
import { formatTimeNumber, formatTimePickerTime } from '@/utils';
import React from 'react';

interface CurrentTimeProps {
  currentTime: Date;
  variant?: Theme;
  orientation?: ScreenOrientation;
  className?: string;
}

const animationStyle = `
  @keyframes blink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0; }
  }
  .blink-colon {
    animation: blink 1s infinite;
  }
`;

/**
 * Current time display component with blinking colon animation
 * @param currentTime - Current time as Date object
 * @param variant - Theme variant for styling (default: Theme.Theme1)
 * @param className - Additional CSS classes
 */
export function CurrentTime({
  currentTime,
  variant = Theme.Theme1,
  orientation = 'landscape',
  className = '',
}: CurrentTimeProps) {
  const { timeNumber, amPm } = formatTimeNumber(formatTimePickerTime(currentTime));
  const [hours, minutes] = timeNumber.split(':');
  const isPortrait = orientation === 'portrait';

  switch (variant) {
    case Theme.Theme1:
      return (
        <React.Fragment>
          <style>{animationStyle}</style>
          <div className={`flex items-baseline gap-[0.5vw] ${className}`}>
            <span
              className={`${isPortrait ? 'text-[10vw]' : 'text-[8vw]'} font-bold ds-digi-font italic`}
              style={{ color: '#E0B05C' }}
            >
              {hours}
              <span className='blink-colon'>:</span>
              {minutes}
            </span>
            <span
              className={`${isPortrait ? 'text-[4vw]' : 'text-[3vw]'} ds-digi-font italic relative top-[1.5vh]`}
              style={{ color: '#E0B05C' }}
            >
              {amPm}
            </span>
          </div>
        </React.Fragment>
      );
    case Theme.Theme2:
      return (
        <React.Fragment>
          <style>{animationStyle}</style>
          <div
            className={
              isPortrait
                ? 'flex items-center justify-start'
                : 'w-[20vw] h-full flex items-center justify-center'
            }
          >
            <div
              className={
                isPortrait
                  ? 'flex items-baseline gap-[1vw]'
                  : 'flex flex-col items-center justify-center'
              }
            >
              <span
                className={`${isPortrait ? 'text-[10vw]' : 'text-[8vw]'} text-white drop-shadow-lg clash-display-bold leading-none`}
              >
                {hours}
                <span className='blink-colon'>:</span>
                {minutes}
              </span>
              <span
                className={`${isPortrait ? 'text-[4vw]' : 'text-[4vw]'} text-white drop-shadow-lg clash-display-medium lowercase leading-none`}
              >
                {amPm}
              </span>
            </div>
          </div>
        </React.Fragment>
      );
    default:
      return null;
  }
}
