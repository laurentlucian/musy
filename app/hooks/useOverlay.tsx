import { create } from 'zustand';
import { shallow } from 'zustand/shallow';

type expandedStore = {
  actions: {
    addToStack: (by: number) => void;
    removeFromStack: (by: number) => void;
  };

  stack: number[] | null;
};

const useExpandedStore = create<expandedStore>()((set) => ({
  actions: {
    addToStack: (by) => set(({ stack }) => ({ stack: stack ? [...stack, by] : [by] })),
    removeFromStack: (by) => set(({ stack }) => ({ stack: stack?.filter((el) => el !== by) })),
  },
  stack: null,
}));

export const useExpandedStack = () => useExpandedStore((state) => state.stack, shallow);
export const useSetExpandedStack = () => useExpandedStore((state) => state.actions);
