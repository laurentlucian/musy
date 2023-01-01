import create from 'zustand';
import shallow from 'zustand/shallow';
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
  const library = useUserLibraryStore((state) => state.library, shallow);
  const setLibrary = useUserLibraryStore((state) => state.setLibrary);

  if (!library) {
    const liked = currentUser?.liked;
    if (liked) {
      setLibrary(new Map(liked.map(({ trackId }) => [trackId, true])));
    }
  }

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

  return { library, isSaved, toggleSave };
};

export default useUserLibrary;
