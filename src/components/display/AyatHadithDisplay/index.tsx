import type { AyatAndHadith } from '@/types';
import bgImage from '@/assets/backgrounds/02.jpeg';

interface AyatHadithDisplayProps {
  item: AyatAndHadith;
}

export function AyatHadithDisplay({ item }: AyatHadithDisplayProps) {
  if (!item) return null;

  return (
    <div
      className='flex flex-col items-center justify-center min-h-screen w-full overflow-hidden relative bg-cover bg-center'
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className='absolute inset-0 bg-black/50 backdrop-blur-sm z-0'></div>

      <div className='w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl z-10'>
        <div className='p-3 sm:p-4 md:p-6'>
          <div className='flex flex-col'>
            <h2 className='text-lg sm:text-xl font-semibold text-white mb-4 text-center'>
              {item.type === 'ayat' ? 'قرآنی آیت' : 'حدیث'}
            </h2>

            <div className='my-4 text-center'>
              <p className='text-lg sm:text-xl md:text-2xl font-arabic leading-relaxed mb-4 text-right text-white'>
                {item.text}
              </p>

              <p className='text-sm sm:text-base md:text-lg italic mb-4 text-white'>
                {item.translation}
              </p>

              <p className='text-xs sm:text-sm text-white/80'>{item.reference}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
