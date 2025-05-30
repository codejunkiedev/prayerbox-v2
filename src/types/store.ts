import type { MasjidProfile } from './supabase';

export type DisplayStore = {
  loggedIn: boolean;
  setLoggedIn: (loggedIn: boolean) => void;
  masjidProfile: MasjidProfile | null;
  setMasjidProfile: (masjidProfile: MasjidProfile | null) => void;
};
