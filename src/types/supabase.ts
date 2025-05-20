export enum SupabaseTables {
  MasjidProfiles = 'masjid_profiles',
  AyatAndHadith = 'ayat_and_hadith',
  Announcements = 'announcements',
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
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  user_id: string;
  description: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
}
