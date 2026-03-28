import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorage } from './asyncStorage';

type PushTokenState = {
  expoPushToken: string | null;
  setExpoPushToken: (token: string) => void;
};

export const usePushTokenStore = create<PushTokenState>()(
  persist(
    (set) => ({
      expoPushToken: null,
      setExpoPushToken: (token) => set({ expoPushToken: token }),
    }),
    {
      name: 'push-token',
      storage: createJSONStorage(() => asyncStorage),
      partialize: (state) => ({ expoPushToken: state.expoPushToken }),
    },
  ),
);
