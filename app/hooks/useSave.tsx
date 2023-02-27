import { create } from 'zustand';
import { shallow } from 'zustand/shallow';

interface SaveStateConfig {
  alert: boolean;
  setAlert: () => void;
  setShow: (by: boolean) => void;
  show: boolean;
}

const useSaveStore = create<SaveStateConfig>()((set) => ({
  alert: false,
  setAlert: () => set({ alert: true }),
  setShow: (by) => set({ alert: false, show: by }),
  show: false,
}));

export const useAlertState = () => useSaveStore((state) => state.alert, shallow);
export const useSaveState = () => useSaveStore((state) => state.show, shallow);
export const useSetShowSave = () => useSaveStore((state) => state.setShow);
export const useSetShowAlert = () => useSaveStore((state) => state.setAlert);
