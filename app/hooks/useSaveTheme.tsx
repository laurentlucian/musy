import { create } from 'zustand';
import { shallow } from 'zustand/shallow';

interface SaveThemeStateConfig {
  alert: boolean;
  setAlert: () => void;
  setShow: (by: boolean) => void;
  show: boolean;
}

const useSaveThemeStore = create<SaveThemeStateConfig>()((set) => ({
  alert: false,
  setAlert: () => set({ alert: true }),
  setShow: (by) => set({ alert: false, show: by }),
  show: false,
}));

export const useAlertState = () => useSaveThemeStore((state) => state.alert, shallow);
export const useSaveState = () => useSaveThemeStore((state) => state.show, shallow);
export const useSetShowSave = () => useSaveThemeStore((state) => state.setShow);
export const useSetShowAlert = () => useSaveThemeStore((state) => state.setAlert);
