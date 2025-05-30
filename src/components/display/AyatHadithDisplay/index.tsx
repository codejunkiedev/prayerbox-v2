import { Card, CardContent } from '@/components/ui';
import type { AyatAndHadith } from '@/types';

interface AyatHadithDisplayProps {
  item: AyatAndHadith;
}

export function AyatHadithDisplay({ item }: AyatHadithDisplayProps) {
  if (!item) return null;

  return (
    <div className='flex flex-col items-center justify-center min-h-screen w-full bg-primary-foreground overflow-hidden relative'>
      <div className='absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 z-0'></div>

      <Card className='w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-card/95 backdrop-blur-sm z-10'>
        <CardContent className='p-3 sm:p-4 md:p-6'>
          <div className='flex flex-col'>
            <h2 className='text-lg sm:text-xl font-semibold text-primary mb-4 text-center'>
              {item.type === 'ayat' ? 'Quranic Verse' : 'Hadith'}
            </h2>

            <div className='my-4 text-center'>
              <p className='text-lg sm:text-xl md:text-2xl font-arabic leading-relaxed mb-4 text-right text-primary-foreground'>
                {item.text}
              </p>

              <p className='text-sm sm:text-base md:text-lg italic mb-4'>{item.translation}</p>

              <p className='text-xs sm:text-sm text-muted-foreground'>{item.reference}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
