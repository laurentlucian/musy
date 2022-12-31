import create from 'zustand';
import type { Track } from '~/lib/types/types';

interface DrawerStateConfig {
  track: Track | null;
  onClose: () => void;
  onSearch: (by: Track) => void;
  isOpen: boolean;
  setOpen: (by: boolean) => void;
  bottom: number;
  right: number;
  setPos: (by: [number, number]) => void;
  icon: string;
  setIcon: (by: string) => void;
}

const useMobileDrawerStore = create<DrawerStateConfig>()((set) => ({
  track: null,
  onClose: () => set({ track: null }),
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
        userId: by.userId,
      },
    }),
  isOpen: false,
  setOpen: (by) => set({ isOpen: by }),
  bottom: 3,
  right: 3,
  setPos: (by) => set({ bottom: by[0], right: by[1] }),
  icon: 'plus',
  setIcon: (by) => set({ icon: by }),
}));

export default useMobileDrawerStore;