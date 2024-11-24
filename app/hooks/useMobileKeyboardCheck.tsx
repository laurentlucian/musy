import { createWithEqualityFn } from "zustand/traditional";
interface DrawerStateConfig {
  actions: {
    hideMenu: () => void;
    showMenu: () => void;
  };
  show: boolean;
}

const useMobileKeyboardCheck = createWithEqualityFn<DrawerStateConfig>()(
  (set) => ({
    actions: {
      hideMenu: () => set({ show: false }),
      showMenu: () => set({ show: true }),
    },
    show: true,
  }),
);

export const useMobileKeyboard = () =>
  useMobileKeyboardCheck((state) => ({
    show: state.show,
  }));

export const useMobileKeyboardActions = () =>
  useMobileKeyboardCheck((state) => state.actions);
