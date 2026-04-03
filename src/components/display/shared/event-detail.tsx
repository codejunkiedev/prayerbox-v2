import type { LucideIcon } from 'lucide-react';

interface EventDetailProps {
  text: string;
  label?: string;
  icon: LucideIcon;
  isPortrait?: boolean;
}

/**
 * Displays event detail information with an icon
 */
export function EventDetail({ text, label, icon: Icon, isPortrait }: EventDetailProps) {
  return (
    <div
      className={`flex items-center stagger-item animate-fade-in-up ${
        isPortrait ? 'gap-[2vw]' : 'gap-4'
      }`}
    >
      <div className={`bg-white/15 rounded-xl shrink-0 ${isPortrait ? 'p-[1.5vw]' : 'p-3'}`}>
        <Icon
          className={isPortrait ? 'text-white' : 'h-6 w-6 text-white'}
          style={isPortrait ? { width: '4vw', height: '4vw' } : undefined}
        />
      </div>
      {label ? (
        <div className='flex flex-col'>
          <span className={`text-white/70 font-medium ${isPortrait ? 'text-[2.2vw]' : 'text-sm'}`}>
            {label}
          </span>
          <span
            className={`text-white font-medium leading-snug ${
              isPortrait ? 'text-[3vw]' : 'text-lg'
            }`}
          >
            {text}
          </span>
        </div>
      ) : (
        <span
          className={`text-white font-medium leading-snug ${isPortrait ? 'text-[3vw]' : 'text-lg'}`}
        >
          {text}
        </span>
      )}
    </div>
  );
}
