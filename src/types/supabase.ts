export enum SupabaseTables {
  MasjidProfiles = 'masjid_profiles',
  AyatAndHadith = 'ayat_and_hadith',
  Announcements = 'announcements',
  Events = 'events',
  Posts = 'posts',
  PrayerTimes = 'prayer_times',
}

export enum SupabaseBuckets {
  MasjidLogos = 'masjid-logos',
  MasjidPosts = 'masjid-posts',
}

interface Base {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface MasjidProfile extends Base {
  code: string;
  logo_url: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
}

export interface AyatAndHadith extends Base {
  text: string;
  translation: string;
  reference: string;
  type: 'ayat' | 'hadith';
  archived: boolean;
}

export interface Announcement extends Base {
  description: string;
  archived: boolean;
}

export interface Event extends Base {
  title: string;
  description: string;
  date_time: string;
  location: string;
  chief_guest: string;
  host: string;
  qari: string;
  naat_khawn: string;
  karm_farma: string;
  archived: boolean;
}

export interface Post extends Base {
  title: string;
  image_url: string;
  archived: boolean;
}

export interface PrayerTimes extends Base {
  calculation_method: number;
  juristic_school: number;
  prayer_adjustments?: {
    fajr: {
      type: 'offset' | 'manual' | 'default';
      offset?: number;
      manual_time?: string;
    };
    sunrise: {
      type: 'offset' | 'manual' | 'default';
      offset?: number;
      manual_time?: string;
    };
    dhuhr: {
      type: 'offset' | 'manual' | 'default';
      offset?: number;
      manual_time?: string;
    };
    asr: {
      type: 'offset' | 'manual' | 'default';
      offset?: number;
      manual_time?: string;
    };
    maghrib: {
      type: 'offset' | 'manual' | 'default';
      offset?: number;
      manual_time?: string;
    };
    isha: {
      type: 'offset' | 'manual' | 'default';
      offset?: number;
      manual_time?: string;
    };
  };
}
