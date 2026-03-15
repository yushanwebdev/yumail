import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorage } from './asyncStorage';

type ReadStatusState = {
  readIds: string[];
  markAsRead: (id: string) => void;
  isRead: (id: string) => boolean;
};

export const useReadStatusStore = create<ReadStatusState>()(
  persist(
    (set, get) => ({
      readIds: [],
      markAsRead: (id) => {
        if (!get().readIds.includes(id)) {
          set((state) => ({ readIds: [...state.readIds, id] }));
        }
      },
      isRead: (id) => get().readIds.includes(id),
    }),
    {
      name: 'read-status',
      storage: createJSONStorage(() => asyncStorage),
      partialize: (state) => ({ readIds: state.readIds }),
    },
  ),
);
