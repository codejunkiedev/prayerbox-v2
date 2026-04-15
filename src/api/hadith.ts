const HADITH_BASE_URL = 'https://hadithapi.com/api';

const API_KEY = import.meta.env.VITE_HADITH_API_KEY ?? '';

export interface HadithDetail {
  hadith_number: string;
  arabic: string;
  urdu: string;
  english: string;
  narrator_english: string;
}

interface RawHadith {
  id: number | string;
  hadithNumber: string;
  hadithEnglish: string;
  hadithUrdu: string;
  hadithArabic: string;
  englishNarrator: string;
}

function assertApiKey() {
  if (!API_KEY) throw new Error('VITE_HADITH_API_KEY is not configured');
}

export async function fetchHadith(
  bookSlug: string,
  hadithNumber: string,
  signal?: AbortSignal
): Promise<HadithDetail> {
  assertApiKey();

  const url = new URL(`${HADITH_BASE_URL}/hadiths`);
  url.searchParams.set('apiKey', API_KEY);
  url.searchParams.set('book', bookSlug);
  url.searchParams.set('hadithNumber', hadithNumber);

  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Failed to fetch hadith: ${response.status}`);

  const body = (await response.json()) as { hadiths: { data: RawHadith[] } };
  const raw = body.hadiths?.data?.[0];
  if (!raw) throw new Error('Hadith not found');

  return {
    hadith_number: raw.hadithNumber,
    arabic: raw.hadithArabic ?? '',
    urdu: raw.hadithUrdu ?? '',
    english: raw.hadithEnglish ?? '',
    narrator_english: raw.englishNarrator ?? '',
  };
}
