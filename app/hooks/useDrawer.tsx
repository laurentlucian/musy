import create from 'zustand';
import type { Track } from '~/lib/types/types';

interface DrawerStateConfig {
  track: Track | null;
  onClose: () => void;
  onOpen: (by: Track) => void;
}

const useDrawerStore = create<DrawerStateConfig>()((set) => ({
  track: null,
  onClose: () => set({ track: null }),
  onOpen: (by) =>
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
        userId: by.userId,
      },
    }),
}));

export default useDrawerStore;
