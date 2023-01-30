import { create } from 'zustand';
import { shallow } from 'zustand/shallow';

import useSessionUser from './useSessionUser';

type UserLibraryStore = {
  library: Map<string, boolean> | null;
  setLibrary: (library: Map<string, boolean>) => void;
};

const useUserLibraryStore = create<UserLibraryStore>((set) => ({
  library: null,
  setLibrary: (library: Map<string, boolean>) => set({ library }),
}));

const useUserLibrary = (trackId: string) => {
  const currentUser = useSessionUser();

  // set zustand state before acces state.library, otherwise first render will be null
  if (!useUserLibraryStore.getState().library && currentUser?.liked) {
    const liked = currentUser?.liked;
    if (liked) {
      // initialize library state
      useUserLibraryStore.setState((prev) => ({
        ...prev,
        library: new Map(liked.map(({ trackId }) => [trackId, true])),
      }));
    }
  }

  const library = useUserLibraryStore((state) => state.library, shallow);
  const setLibrary = useUserLibraryStore((state) => state.setLibrary);

  const toggleSave = (trackId: string) => {
    const newLikedMap = new Map(library);
    newLikedMap.set(trackId, !newLikedMap.get(trackId));
    setLibrary(newLikedMap);
  };

  const isSavedFn = (trackId: string) => {
    if (!library) return false;
    return !!library.get(trackId);
  };

  const isSaved = isSavedFn(trackId);

  return { isSaved, library, toggleSave };
};

export default useUserLibrary;
