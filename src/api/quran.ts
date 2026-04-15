const ALQURAN_BASE_URL = 'https://api.alquran.cloud/v1';

export interface AyahResult {
  arabic: string;
  translations: Record<string, string>;
}

interface AlQuranEnvelope<T> {
  code: number;
  status: string;
  data: T;
}

interface AlQuranAyah {
  text: string;
  edition: { identifier: string };
}

export async function fetchAyahWithEditions(
  surah: number,
  ayah: number,
  editionIds: string[],
  signal?: AbortSignal
): Promise<AyahResult> {
  const editionsParam = editionIds.join(',');
  const url = `${ALQURAN_BASE_URL}/ayah/${surah}:${ayah}/editions/${editionsParam}`;

  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`AlQuran.cloud failed: ${response.status}`);

  const body = (await response.json()) as AlQuranEnvelope<AlQuranAyah[]>;
  if (body.code !== 200 || !Array.isArray(body.data)) {
    throw new Error('AlQuran.cloud returned unexpected payload');
  }

  const arabicItem = body.data.find(item => item.edition.identifier === 'quran-uthmani');
  const arabic = arabicItem?.text ?? '';

  const translations: Record<string, string> = {};
  for (const item of body.data) {
    if (item.edition.identifier !== 'quran-uthmani') {
      translations[item.edition.identifier] = item.text;
    }
  }

  return { arabic, translations };
}
