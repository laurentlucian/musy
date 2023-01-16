import { create } from 'zustand';

export const useRevalidatorStore = create<{
  shouldRevalidate: string | null;
  setShouldRevalidate: ({ userId }: { userId: string }) => void;
}>((set) => ({
  shouldRevalidate: null,
  setShouldRevalidate: ({ userId }) => set({ shouldRevalidate: userId }),
}));
