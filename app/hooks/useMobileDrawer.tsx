import { create } from 'zustand';
import type { Track } from '~/lib/types/types';

interface DrawerStateConfig {
  track: Track | null;
  isOpen: boolean;
  bottom: number;
  right: number;
  icon: 'x' | 'down' | 'plus';
  actions: {
    addFocus: () => void;
    removeFocus: () => void;
    onClose: () => void;
    onSearch: (by: Track) => void;
    onOpen: () => void;
  };
}

const useMobileDrawerStore = create<DrawerStateConfig>()((set) => ({
  track: null,
  isOpen: false,
  bottom: 3,
  right: 3,
  icon: 'plus',
  actions: {
    addFocus: () => set({ bottom: 305, right: 3, icon: 'down' }),
    removeFocus: () => set({ bottom: 3, right: 3, icon: 'x' }),
    onClose: () => set({ track: null, isOpen: false, icon: 'plus', bottom: 3, right: 3 }),
    onOpen: () => set({ isOpen: true, icon: 'down', bottom: 305, right: 3 }),
    onSearch: (by) =>
      set({
        track: {
          uri: by.uri,
          trackId: by.trackId,
          image: by.image,
          albumUri: by.albumUri,
          albumName: by.albumName,
          name: by.name,
          artist: by.artist,
          artistUri: by.artistUri,
          explicit: by.explicit,
          preview_url: by.preview_url,
          userId: by.userId,
        },
      }),
  },
}));

export const useMobileDrawer = () =>
  useMobileDrawerStore((state) => ({
    track: state.track,
    isOpen: state.isOpen,
    bottom: state.bottom,
    right: state.right,
    icon: state.icon,
  }));

export const useMobileDrawerActions = () => useMobileDrawerStore((state) => state.actions);
