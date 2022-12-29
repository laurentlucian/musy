import create from 'zustand/react';

interface Track {
  uri: string;
  trackId?: string;
  image: string;
  albumUri: string | null;
  albumName: string | null;
  name: string;
  artist: string | null;
  artistUri: string | null;
  explicit: boolean;
}

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
      },
    }),
}));

export default useDrawerStore;
