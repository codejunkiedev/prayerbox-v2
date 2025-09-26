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

/**
 * Displays announcements in a card layout with animation and background image
 */
export function AnnouncementsDisplay({ announcements }: AnnouncementsDisplayProps) {
  if (!announcements.length) return null;

  const announcement = announcements[0];

  const getDynamicWidth = (length: number) => {
    if (length < 50) return 'md'; // Short text: medium width
    return 'lg'; // Long text: large width
  };

  const getDynamicFontClass = (length: number) => {
    if (length < 50) {
      // Short: larger sizes
      return 'text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl [@media(min-width:3000px)]:text-[8.4rem] [@media(min-width:4000px)]:text-[10.5rem]';
    } else if (length <= 200) {
      // Medium: medium sizes
      return 'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl [@media(min-width:3000px)]:text-[6.3rem] [@media(min-width:4000px)]:text-[8.4rem]';
    } else {
      // Long: smaller sizes
      return 'text-lg sm:text-lg md:text-xl lg:text-2xl xl:text-4xl 2xl:text-5xl [@media(min-width:3000px)]:text-[5.25rem] [@media(min-width:4000px)]:text-[6.3rem]';
    }
  };

  return (
    <DisplayContainer backgroundImage={bgImage}>
      <DisplayCard width={getDynamicWidth(announcement.description.length)}>
        <AnimationProvider>
          <DisplayHeading title='اعلان' />

          <motion.div
            variants={itemVariants}
            className='min-h-[150px] 2xl:min-h-[200px] [@media(min-width:3000px)]:min-h-[184px] [@media(min-width:4000px)]:min-h-[204px] flex items-center justify-center'
          >
            <motion.p
              className={`text-white ${getDynamicFontClass(announcement.description.length)} text-center leading-relaxed`}
            >
              {announcement.description}
            </motion.p>
          </motion.div>
        </AnimationProvider>
      </DisplayCard>
    </DisplayContainer>
  );
}
