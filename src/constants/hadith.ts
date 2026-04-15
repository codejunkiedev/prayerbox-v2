export interface HadithBook {
  slug: string;
  name: string;
  name_arabic: string;
  max_hadith_number: number;
}

export const HADITH_BOOKS: HadithBook[] = [
  {
    slug: 'sahih-bukhari',
    name: 'Sahih al-Bukhari',
    name_arabic: 'صحيح البخاري',
    max_hadith_number: 7276,
  },
  {
    slug: 'sahih-muslim',
    name: 'Sahih Muslim',
    name_arabic: 'صحيح مسلم',
    max_hadith_number: 7563,
  },
  {
    slug: 'al-tirmidhi',
    name: 'Jami at-Tirmidhi',
    name_arabic: 'جامع الترمذي',
    max_hadith_number: 3955,
  },
  {
    slug: 'abu-dawood',
    name: 'Sunan Abu Dawud',
    name_arabic: 'سنن أبي داود',
    max_hadith_number: 5274,
  },
  {
    slug: 'sunan-nasai',
    name: 'Sunan an-Nasai',
    name_arabic: 'سنن النسائي',
    max_hadith_number: 5761,
  },
  {
    slug: 'ibn-e-majah',
    name: 'Sunan Ibn Majah',
    name_arabic: 'سنن ابن ماجه',
    max_hadith_number: 4341,
  },
];

export interface HadithTranslationLang {
  id: 'urdu' | 'english';
  name: string;
}

export const HADITH_TRANSLATION_LANGS: HadithTranslationLang[] = [
  { id: 'urdu', name: 'Urdu' },
  { id: 'english', name: 'English' },
];
