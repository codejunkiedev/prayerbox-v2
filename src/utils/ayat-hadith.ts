import { HADITH_BOOKS, SURAHS } from '@/constants';
import type { AyatAndHadith, AyatSource, HadithSource, PostOrientation } from '@/types';

export function formatSlideReference(item: AyatAndHadith): string {
  if (item.type === 'ayat') {
    const src = item.source as AyatSource;
    const surah = SURAHS.find(s => s.number === src.surah);
    return `Surah ${surah?.name_english ?? src.surah} ${src.surah}:${src.ayah}`;
  }
  const src = item.source as HadithSource;
  const book = HADITH_BOOKS.find(b => b.slug === src.book);
  return `${book?.name ?? src.book} #${src.hadith_number}`;
}

export function slideToPostOrientation(o: AyatAndHadith['orientation']): PostOrientation {
  return o === 'landscape' ? 'landscape' : 'portrait';
}
