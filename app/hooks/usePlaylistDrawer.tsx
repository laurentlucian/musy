import type { PlaylistTrack } from '~/lib/types/types';
import { shallow } from 'zustand/shallow';
import { create } from 'zustand';

interface DrawerStateConfig {
  playlist: PlaylistTrack | null;
  actions: {
    onClose: () => void;
    onOpen: (by: PlaylistTrack) => void;
  };
}

const useDrawerStore = create<DrawerStateConfig>()((set) => ({
  playlist: null,
  actions: {
    onClose: () => set({ playlist: null }),
    onOpen: (by) =>
      set({
        playlist: {
          uri: by.uri,
          link: by.link,
          name: by.name,
          image: by.image,
          trackTotal: by.trackTotal,
          tracks: by.tracks,
          userId: by.userId,
          isPublic: by.isPublic,
          playlistId: by.playlistId,
          description: by.description,
        },
      }),
  },
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
