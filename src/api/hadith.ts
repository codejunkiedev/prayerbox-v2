import { captureExternalFetchError } from '@/lib/sentry';

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
  bookSlug?: string;
  status?: string;
  book?: { bookName?: string };
  chapter?: {
    chapterNumber?: string;
    chapterEnglish?: string;
    chapterUrdu?: string;
    chapterArabic?: string;
  };
}

export interface HadithSearchResult {
  id: string;
  hadith_number: string;
  book_slug: string;
  book_name: string;
  chapter_number: string;
  chapter_english: string;
  arabic: string;
  urdu: string;
  english: string;
  narrator_english: string;
  status: string;
}

export interface HadithSearchResponse {
  results: HadithSearchResult[];
  current_page: number;
  last_page: number;
  total: number;
}

export type HadithSearchLanguage = 'english' | 'urdu' | 'arabic';

export interface HadithSearchParams {
  query: string;
  language?: HadithSearchLanguage;
  bookSlug?: string;
  page?: number;
  paginate?: number;
}

function assertApiKey() {
  if (!API_KEY) throw new Error('VITE_HADITH_API_KEY is not configured');
}

export async function fetchHadith(
  bookSlug: string,
  hadithNumber: string,
  signal?: AbortSignal
): Promise<HadithDetail> {
  try {
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
  } catch (error) {
    captureExternalFetchError(error, {
      source: 'hadith',
      operation: 'fetchHadith',
      extra: { bookSlug, hadithNumber },
    });
    throw error;
  }
}

const SEARCH_PARAM_BY_LANGUAGE: Record<HadithSearchLanguage, string> = {
  english: 'hadithEnglish',
  urdu: 'hadithUrdu',
  arabic: 'hadithArabic',
};

export async function searchHadith(
  { query, language = 'english', bookSlug, page = 1, paginate = 25 }: HadithSearchParams,
  signal?: AbortSignal
): Promise<HadithSearchResponse> {
  try {
    assertApiKey();

    const url = new URL(`${HADITH_BASE_URL}/hadiths`);
    url.searchParams.set('apiKey', API_KEY);
    url.searchParams.set(SEARCH_PARAM_BY_LANGUAGE[language], query);
    url.searchParams.set('paginate', String(paginate));
    url.searchParams.set('page', String(page));
    if (bookSlug) url.searchParams.set('book', bookSlug);

    const response = await fetch(url, { signal });

    if (response.status === 404) {
      return { results: [], current_page: page, last_page: 1, total: 0 };
    }
    if (!response.ok) throw new Error(`Failed to search hadiths: ${response.status}`);

    const body = (await response.json()) as {
      hadiths?: {
        current_page?: number;
        last_page?: number;
        total?: number;
        data?: RawHadith[];
      };
    };

    const data = body.hadiths?.data ?? [];
    return {
      results: data.map(raw => ({
        id: String(raw.id),
        hadith_number: raw.hadithNumber,
        book_slug: raw.bookSlug ?? '',
        book_name: raw.book?.bookName ?? '',
        chapter_number: raw.chapter?.chapterNumber ?? '',
        chapter_english: raw.chapter?.chapterEnglish ?? '',
        arabic: raw.hadithArabic ?? '',
        urdu: raw.hadithUrdu ?? '',
        english: raw.hadithEnglish ?? '',
        narrator_english: raw.englishNarrator ?? '',
        status: raw.status ?? '',
      })),
      current_page: body.hadiths?.current_page ?? page,
      last_page: body.hadiths?.last_page ?? 1,
      total: body.hadiths?.total ?? data.length,
    };
  } catch (error) {
    captureExternalFetchError(error, {
      source: 'hadith',
      operation: 'searchHadith',
      extra: { query, language, bookSlug, page },
    });
    throw error;
  }
}
