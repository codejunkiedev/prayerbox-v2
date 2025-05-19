export enum SupabaseTables {
  MasjidProfiles = 'masjid_profiles',
  AyatAndHadith = 'ayat_and_hadith',
}

export enum SupabaseBuckets {
  MasjidLogos = 'masjid-logos',
}

export interface MasjidProfile {
  id: string;
  user_id: string;
  address: string;
  code: string;
  logo_url: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface AyatAndHadith {
  id: string;
  user_id: string;
  text: string;
  translation: string;
  reference: string;
  type: 'ayat' | 'hadith';
  archived: boolean | null;
  created_at: string;
  updated_at: string;
}
