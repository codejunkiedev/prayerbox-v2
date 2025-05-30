import type { Announcement } from '@/types';
import bgImage from '@/assets/backgrounds/01.jpeg';
import { motion } from 'framer-motion';
import {
  AnimationProvider,
  DisplayContainer,
  DisplayCard,
  DisplayHeading,
  itemVariants,
} from '../shared';

interface AnnouncementsDisplayProps {
  announcements: Announcement[];
}

export function AnnouncementsDisplay({ announcements }: AnnouncementsDisplayProps) {
  if (!announcements.length) return null;

  const announcement = announcements[0];

  return (
    <DisplayContainer backgroundImage={bgImage}>
      <DisplayCard width='md'>
        <AnimationProvider>
          <DisplayHeading title='اعلان' />

          <motion.div
            variants={itemVariants}
            className='min-h-[120px] flex items-center justify-center'
          >
            <motion.p className='text-white text-base sm:text-lg md:text-xl text-center leading-relaxed'>
              {announcement.description}
            </motion.p>
          </motion.div>
        </AnimationProvider>
      </DisplayCard>
    </DisplayContainer>
  );
}
