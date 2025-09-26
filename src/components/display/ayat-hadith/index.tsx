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

/**
 * Displays Quranic verses or Hadith with Arabic text, translation, and reference
 */
export function AyatHadithDisplay({ item }: AyatHadithDisplayProps) {
  if (!item) return null;

  const getDynamicWidth = (length: number) => {
    if (length < 50) return 'md'; // Very short: medium width
    if (length < 150) return 'lg'; // Short to medium: large width
    return 'xl'; // Long: extra large width
  };

  const getArabicTextClass = (length: number) => {
    if (length < 50) {
      // Very short: largest sizes
      return 'text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl [@media(min-width:3000px)]:text-[10.2rem] [@media(min-width:4000px)]:text-[12rem]';
    } else if (length < 100) {
      // Short: larger sizes
      return 'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl [@media(min-width:3000px)]:text-[8.925rem] [@media(min-width:4000px)]:text-[10.5rem]';
    } else if (length <= 200) {
      // Medium: medium sizes
      return 'text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl [@media(min-width:3000px)]:text-[7.14rem] [@media(min-width:4000px)]:text-[8.4rem]';
    } else if (length <= 300) {
      // Medium-long: smaller sizes
      return 'text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl [@media(min-width:3000px)]:text-[5.1rem] [@media(min-width:4000px)]:text-[6rem]';
    } else {
      // Long: smallest sizes
      return 'text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl [@media(min-width:3000px)]:text-[4.25rem] [@media(min-width:4000px)]:text-[5rem]';
    }
  };

  const getTranslationClass = (length: number) => {
    if (length < 100) {
      // Short: larger sizes
      return 'text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl [@media(min-width:3000px)]:text-[6.375rem] [@media(min-width:4000px)]:text-[7.5rem]';
    } else if (length <= 300) {
      // Medium: medium sizes
      return 'text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl [@media(min-width:3000px)]:text-[5.1rem] [@media(min-width:4000px)]:text-[6rem]';
    } else {
      // Long: smaller sizes
      return 'text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl [@media(min-width:3000px)]:text-[3.825rem] [@media(min-width:4000px)]:text-[4.5rem]';
    }
  };

  const getReferenceClass = (length: number) => {
    if (length < 100) {
      // Short: larger sizes
      return 'text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl [@media(min-width:3000px)]:text-[4.25rem] [@media(min-width:4000px)]:text-[5rem]';
    } else if (length <= 300) {
      // Medium: medium sizes
      return 'text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl [@media(min-width:3000px)]:text-[3.4rem] [@media(min-width:4000px)]:text-[4rem]';
    } else {
      // Long: smaller sizes
      return 'text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg 2xl:text-xl [@media(min-width:3000px)]:text-[2.55rem] [@media(min-width:4000px)]:text-[3rem]';
    }
  };

  return (
    <DisplayContainer backgroundImage={bgImage}>
      <DisplayCard
        width={getDynamicWidth(item.text.length)}
        padding={item.type === 'ayat' ? 'large' : 'medium'}
      >
        <AnimationProvider>
          <DisplayHeading
            title={item.type === 'ayat' ? 'قرآنی آیت' : 'حدیث'}
            size={item.type === 'ayat' ? 'sm' : 'md'}
          />

          <motion.div
            variants={itemVariants}
            className={`my-4 2xl:my-6 [@media(min-width:3000px)]:my-8 [@media(min-width:4000px)]:my-10 text-center ${
              item.type === 'ayat'
                ? 'pt-3 2xl:pt-5 [@media(min-width:3000px)]:pt-8 [@media(min-width:4000px)]:pt-10'
                : ''
            }`}
          >
            <motion.p
              className={`font-arabic leading-relaxed mb-6 2xl:mb-8 [@media(min-width:3000px)]:mb-10 [@media(min-width:4000px)]:mb-12 text-right text-white whitespace-pre-line ${getArabicTextClass(item.text.length)}`}
            >
              {item.text}
            </motion.p>

            <motion.p
              className={`italic mb-6 2xl:mb-8 [@media(min-width:3000px)]:mb-10 [@media(min-width:4000px)]:mb-12 text-white ${getTranslationClass(item.text.length)}`}
            >
              {item.translation}
            </motion.p>

            <motion.p className={`text-white/80 ${getReferenceClass(item.text.length)}`}>
              {item.reference}
            </motion.p>
          </motion.div>
        </AnimationProvider>
      </DisplayCard>
    </DisplayContainer>
  );
}
