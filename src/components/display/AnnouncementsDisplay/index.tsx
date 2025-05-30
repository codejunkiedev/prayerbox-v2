import type { Announcement } from '@/types';
import bgImage from '@/assets/backgrounds/01.jpeg';

interface AnnouncementsDisplayProps {
  announcements: Announcement[];
}

export function AnnouncementsDisplay({ announcements }: AnnouncementsDisplayProps) {
  if (!announcements.length) return null;

  const announcement = announcements[0];

  return (
    <div
      className='flex flex-col items-center justify-center min-h-screen w-full overflow-hidden relative bg-cover bg-center'
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className='absolute inset-0 bg-black/50 backdrop-blur-sm z-0'></div>

      <div className='w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl z-10'>
        <div className='p-3 sm:p-4 md:p-6'>
          <div className='flex flex-col'>
            <h2 className='text-lg sm:text-xl font-semibold text-white mb-4 text-center'>اعلان</h2>
            <div className='min-h-[100px] flex items-center justify-center'>
              <p className='text-white text-sm sm:text-base md:text-lg text-center'>
                {announcement.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
