import type { LucideIcon } from 'lucide-react';

interface EventDetailProps {
  text: string;
  icon: LucideIcon;
}

/**
 * Displays event detail information with an icon and hover animations for interactive presentation
 */
export function EventDetail({ text, icon: Icon }: EventDetailProps) {
  return (
    <div className='flex items-start justify-between gap-3 stagger-item animate-fade-in-up transition-transform duration-200 hover:translate-x-[5px]'>
      <span className='rtl text-right'>{text}</span>
      <div className='bg-white/20 p-2 rounded-full transition-transform duration-200 hover:scale-[1.2] hover:rotate-[15deg]'>
        <Icon className='h-5 w-5 text-white' />
      </div>
    </div>
  );
}
