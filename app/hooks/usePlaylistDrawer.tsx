import { create } from 'zustand';
import { shallow } from 'zustand/shallow';

import type { PlaylistTrack } from '~/lib/types/types';

interface DrawerStateConfig {
  actions: {
    onClose: () => void;
    onOpen: (by: PlaylistTrack) => void;
  };
  playlist: PlaylistTrack | null;
}

const useDrawerStore = create<DrawerStateConfig>()((set) => ({
  actions: {
    onClose: () => set({ playlist: null }),
    onOpen: (by) =>
      set({
        playlist: {
          description: by.description,
          image: by.image,
          isPublic: by.isPublic,
          link: by.link,
          name: by.name,
          playlistId: by.playlistId,
          trackTotal: by.trackTotal,
          tracks: by.tracks,
          uri: by.uri,
          userId: by.userId,
        },
      }),
  },
  playlist: null,
}));

export const usePlaylistDrawerStore = () =>
  useDrawerStore(
    (state) => state.playlist,
    // by default, zustand checks if state changes with a strict equality check
    // this means that if you have an object in state, it would always be considered changed
    // a shallow comparison is used for objects
    shallow,
  );

export const usePlaylistDrawerActions = () => useDrawerStore((state) => state.actions);
