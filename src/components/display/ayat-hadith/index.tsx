import type { AyatAndHadith } from '@/types';
import bgImage from '@/assets/backgrounds/02.jpeg';
import { AnimationProvider, DisplayContainer, DisplayCard, DisplayHeading } from '../shared';

interface AyatHadithDisplayProps {
  item: AyatAndHadith;
}

/**
 * Displays Quranic verses or Hadith with Arabic text, translation, and reference
 */
export function AyatHadithDisplay({ item }: AyatHadithDisplayProps) {
  if (!item) return null;

  return (
    <DisplayContainer backgroundImage={bgImage}>
      <DisplayCard>
        <AnimationProvider>
          <DisplayHeading title={item.type === 'ayat' ? 'قرآنی آیت' : 'حدیث'} />

          <div className='my-4 text-center stagger-item animate-fade-in-up'>
            <p className='text-lg sm:text-xl md:text-2xl font-arabic leading-relaxed mb-6 text-right text-white'>
              {item.text}
            </p>

            <p className='text-sm sm:text-base md:text-lg italic mb-6 text-white'>
              {item.translation}
            </p>

            <p className='text-xs sm:text-sm text-white/80'>{item.reference}</p>
          </div>
        </AnimationProvider>
      </DisplayCard>
    </DisplayContainer>
  );
}
