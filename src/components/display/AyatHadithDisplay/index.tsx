import type { AyatAndHadith } from '@/types';
import bgImage from '@/assets/backgrounds/02.jpeg';
import { motion } from 'framer-motion';
import {
  AnimationProvider,
  DisplayContainer,
  DisplayCard,
  DisplayHeading,
  itemVariants,
} from '../shared';

interface AyatHadithDisplayProps {
  item: AyatAndHadith;
}

export function AyatHadithDisplay({ item }: AyatHadithDisplayProps) {
  if (!item) return null;

  return (
    <DisplayContainer backgroundImage={bgImage}>
      <DisplayCard>
        <AnimationProvider>
          <DisplayHeading title={item.type === 'ayat' ? 'قرآنی آیت' : 'حدیث'} />

          <motion.div variants={itemVariants} className='my-4 text-center'>
            <motion.p className='text-lg sm:text-xl md:text-2xl font-arabic leading-relaxed mb-6 text-right text-white'>
              {item.text}
            </motion.p>

            <motion.p className='text-sm sm:text-base md:text-lg italic mb-6 text-white'>
              {item.translation}
            </motion.p>

            <motion.p className='text-xs sm:text-sm text-white/80'>{item.reference}</motion.p>
          </motion.div>
        </AnimationProvider>
      </DisplayCard>
    </DisplayContainer>
  );
}
