import type { LucideIcon } from 'lucide-react';

interface EventDetailProps {
  text: string;
  icon: LucideIcon;
}

/**
 * Displays event detail information with an icon
 */
export function EventDetail({ text, icon: Icon }: EventDetailProps) {
  return (
    <div className='flex items-center gap-4 stagger-item animate-fade-in-up'>
      <div className='bg-white/15 p-3 rounded-xl shrink-0'>
        <Icon className='h-6 w-6 text-white' />
      </div>
      <span className='rtl text-right text-white text-lg font-medium leading-snug'>{text}</span>
    </div>
  );
}
