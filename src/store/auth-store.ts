import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthStore } from '@/types';

enum StorageKeys {
  Auth = 'auth',
}

export const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      masjidId: null,
      role: null,
      setAuth: (masjidId, role) => set({ masjidId, role }),
      clearAuth: () => set({ masjidId: null, role: null }),
    }),
    { name: StorageKeys.Auth, storage: createJSONStorage(() => localStorage) }
  )
);
