import { create } from 'zustand';

import type { Track } from '~/lib/types/types';

interface DrawerStateConfig {
  actions: {
    addFocus: () => void;
    hideButton: () => void;
    onClose: () => void;
    onOpen: () => void;
    onSearch: (by: Track) => void;
    removeFocus: () => void;
    showButton: () => void;
  };
  bottom: number;
  icon: 'x' | 'down' | 'plus';
  isOpen: boolean;
  right: number;
  track: Track | null;
}

const useMobileDrawerStore = create<DrawerStateConfig>()((set) => ({
  actions: {
    addFocus: () => set({ bottom: 340, icon: 'down', right: 3 }),
    hideButton: () => set({ right: -50 }),
    onClose: () => set({ bottom: 3, icon: 'plus', isOpen: false, right: 3, track: null }),
    onOpen: () => set({ bottom: 340, icon: 'down', isOpen: true, right: 3 }),
    onSearch: (by) =>
      set({
        track: {
          albumName: by.albumName,
          albumUri: by.albumUri,
          artist: by.artist,
          artistUri: by.artistUri,
          explicit: by.explicit,
          image: by.image,
          link: by.link,
          name: by.name,
          preview_url: by.preview_url,
          trackId: by.trackId,
          uri: by.uri,
          userId: by.userId,
        },
      }),
    removeFocus: () => set({ bottom: 3, icon: 'x', right: 3 }),
    showButton: () => set({ bottom: 3, right: 3 }),
  },
  bottom: 3,
  icon: 'plus',
  isOpen: false,
  right: 3,
  track: null,
}));

export const useMobileDrawer = () =>
  useMobileDrawerStore((state) => ({
    bottom: state.bottom,
    icon: state.icon,
    isOpen: state.isOpen,
    right: state.right,
    track: state.track,
  }));

export const useMobileDrawerActions = () => useMobileDrawerStore((state) => state.actions);
