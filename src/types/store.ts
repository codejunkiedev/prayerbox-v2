import type { DisplayScreen, MasjidProfile, MemberRole } from './supabase';

export type DisplayStore = {
  loggedIn: boolean;
  setLoggedIn: (loggedIn: boolean) => void;
  masjidProfile: MasjidProfile | null;
  setMasjidProfile: (masjidProfile: MasjidProfile | null) => void;
  displayScreen: DisplayScreen | null;
  setDisplayScreen: (displayScreen: DisplayScreen | null) => void;
  signOut: () => void;
};

export type AuthStore = {
  masjidId: string | null;
  role: MemberRole | null;
  setAuth: (masjidId: string | null, role: MemberRole) => void;
  clearAuth: () => void;
};
