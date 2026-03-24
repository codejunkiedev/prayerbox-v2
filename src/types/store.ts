import type { DisplayScreen, MasjidProfile } from './supabase';

export type DisplayStore = {
  loggedIn: boolean;
  setLoggedIn: (loggedIn: boolean) => void;
  masjidProfile: MasjidProfile | null;
  setMasjidProfile: (masjidProfile: MasjidProfile | null) => void;
  displayScreen: DisplayScreen | null;
  setDisplayScreen: (displayScreen: DisplayScreen | null) => void;
  signOut: () => void;
};
