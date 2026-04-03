import type { AyatAndHadith, ScreenOrientation } from '@/types';
import bgImage from '@/assets/backgrounds/02.jpeg';
import { AnimationProvider, DisplayContainer, DisplayCard, DisplayHeading } from '../shared';

interface AyatHadithDisplayProps {
  item: AyatAndHadith;
  orientation?: ScreenOrientation;
}

/**
 * Displays Quranic verses or Hadith with Arabic text, translation, and reference
 */
export function AyatHadithDisplay({ item, orientation = 'landscape' }: AyatHadithDisplayProps) {
  if (!item) return null;

  const isPortrait = orientation === 'portrait';

  return (
    <DisplayContainer backgroundImage={bgImage}>
      <DisplayCard>
        <AnimationProvider>
          <DisplayHeading title={item.type === 'ayat' ? 'قرآنی آیت' : 'حدیث'} />

          <div className='my-4 text-center stagger-item animate-fade-in-up'>
            <p
              className={`font-arabic leading-relaxed mb-6 text-center text-white ${
                isPortrait ? 'text-[4vw]' : 'text-lg sm:text-xl md:text-2xl'
              }`}
            >
              {item.text}
            </p>

            <p
              className={`italic mb-6 text-white ${
                isPortrait ? 'text-[3vw]' : 'text-sm sm:text-base md:text-lg'
              }`}
            >
              {item.translation}
            </p>

            <p className={`text-white/80 ${isPortrait ? 'text-[2.5vw]' : 'text-xs sm:text-sm'}`}>
              {item.reference}
            </p>
          </div>
        </AnimationProvider>
      </DisplayCard>
    </DisplayContainer>
  );
}
