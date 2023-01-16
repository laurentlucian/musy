import create from 'zustand';
import shallow from 'zustand/shallow';
import type { PlaylistTrack } from '~/lib/types/types';

interface DrawerStateConfig {
  track: PlaylistTrack | null;
  actions: {
    onClose: () => void;
    onOpen: (by: PlaylistTrack) => void;
  };
}

const useDrawerStore = create<DrawerStateConfig>()((set) => ({
  track: null,
  actions: {
    onClose: () => set({ track: null }),
    onOpen: (by) =>
      set({
        track: {
          uri: by.uri,
          trackId: by.trackId,
          image: by.image,
          name: by.name,
          description: by.description,
          explicit: by.explicit,
          userId: by.userId,
        },
      }),
  },
}));

export const usePlaylistDrawerTrack = () =>
  useDrawerStore(
    (state) => state.track,
    // by default, zustand checks if state changes with a strict equality check
    // this means that if you have an object in state, it would always be considered changed
    // a shallow comparison is used for objects
    shallow,
  );

export const usePlaylistDrawerActions = () => useDrawerStore((state) => state.actions);
