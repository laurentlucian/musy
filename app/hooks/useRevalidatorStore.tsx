import { create } from 'zustand';

export const useRevalidatorStore = create<{
  setShouldRevalidate: ({ userId }: { userId: string }) => void;
  shouldRevalidate: string | null;
}>((set) => ({
  setShouldRevalidate: ({ userId }) => set({ shouldRevalidate: userId }),
  shouldRevalidate: null,
}));
