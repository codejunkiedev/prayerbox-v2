export enum SupabaseTables {
  MasjidProfiles = 'masjid_profiles',
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
