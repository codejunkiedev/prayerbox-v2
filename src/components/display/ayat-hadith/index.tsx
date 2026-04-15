import type { AyatAndHadith } from '@/types';
import { AnimationProvider } from '../shared';

interface AyatHadithDisplayProps {
  slide: AyatAndHadith;
}

export function AyatHadithDisplay({ slide }: AyatHadithDisplayProps) {
  if (!slide || !slide.image_url) return null;

  return (
    <div className='w-full h-screen overflow-hidden'>
      <AnimationProvider>
        <div className='w-full h-full stagger-item animate-fade-in-up'>
          <img
            src={slide.image_url}
            alt={slide.type === 'ayat' ? 'Ayat slide' : 'Hadith slide'}
            className='w-full h-full object-cover'
          />
        </div>
      </AnimationProvider>
    </div>
  );
}
