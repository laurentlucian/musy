import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";

interface DrawerStateConfig {
  actions: {
    onClose: () => void;
    onOpen: (playlist: SpotifyApi.PlaylistObjectSimplified) => void;
  };
  playlist: SpotifyApi.PlaylistObjectSimplified | null;
}

const useDrawerStore = createWithEqualityFn<DrawerStateConfig>()(
  (set) => ({
    actions: {
      onClose: () => set({ playlist: null }),
      onOpen: (playlist) =>
        set({
          playlist,
        }),
    },
    playlist: null,
  }),
  Object.is,
);

export const usePlaylistDrawerStore = () =>
  useDrawerStore(
    (state) => state.playlist,
    // by default, zustand checks if state changes with a strict equality check
    // this means that if you have an object in state, it would always be considered changed
    // a shallow comparison is used for objects
    shallow,
  );

export const usePlaylistDrawerActions = () =>
  useDrawerStore((state) => state.actions);
