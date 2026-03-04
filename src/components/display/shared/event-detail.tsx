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
    <div className='flex items-start justify-between gap-3 stagger-item animate-fade-in-up'>
      <span className='rtl text-right'>{text}</span>
      <div className='bg-white/20 p-2 rounded-full'>
        <Icon className='h-5 w-5 text-white' />
      </div>
    </div>
  );
}
