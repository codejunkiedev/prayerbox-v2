import { Card, CardContent } from '@/components/ui';
import type { Announcement } from '@/types';

interface AnnouncementsDisplayProps {
  announcements: Announcement[];
}

export function AnnouncementsDisplay({ announcements }: AnnouncementsDisplayProps) {
  if (!announcements.length) return null;

  const announcement = announcements[0];

  return (
    <div className='flex flex-col items-center justify-center min-h-screen w-full bg-primary-foreground overflow-hidden relative'>
      <div className='absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 z-0'></div>

      <Card className='w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl bg-card/95 backdrop-blur-sm z-10'>
        <CardContent className='p-3 sm:p-4 md:p-6'>
          <div className='flex flex-col'>
            <h2 className='text-lg sm:text-xl font-semibold text-primary mb-4 text-center'>
              Announcement
            </h2>
            <div className='min-h-[100px] flex items-center justify-center'>
              <p className='text-foreground/90 text-sm sm:text-base md:text-lg text-center'>
                {announcement.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
