import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorage } from './asyncStorage';

type ReadStatusState = {
  readIds: string[];
  markAsRead: (id: string) => void;
  toggleRead: (id: string) => void;
  isRead: (id: string) => boolean;
};

const useReadStatusStore = create<ReadStatusState>()(
  persist(
    (set, get) => ({
      readIds: [],
      markAsRead: (id) => {
        if (!get().readIds.includes(id)) {
          set((state) => ({ readIds: [...state.readIds, id] }));
        }
      },
      toggleRead: (id) => {
        if (get().readIds.includes(id)) {
          set((state) => ({ readIds: state.readIds.filter((r) => r !== id) }));
        } else {
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

export function markAsRead(id: string) {
  useReadStatusStore.getState().markAsRead(id);
}

export function toggleRead(id: string) {
  useReadStatusStore.getState().toggleRead(id);
}

export function isRead(id: string): boolean {
  return useReadStatusStore.getState().isRead(id);
}
