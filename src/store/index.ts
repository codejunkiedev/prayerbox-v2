import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DisplayStore } from '@/types';

enum StorageKeys {
  Display = 'display',
}

const storage = createJSONStorage(() => localStorage);

export const useDisplayStore = create<DisplayStore>()(
  persist(
    set => ({
      loggedIn: false,
      setLoggedIn: loggedIn => set({ loggedIn }),
      masjidProfile: null,
      setMasjidProfile: masjidProfile => set({ masjidProfile }),
    }),
    { name: StorageKeys.Display, storage }
  )
);
