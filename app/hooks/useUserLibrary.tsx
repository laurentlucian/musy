import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";

import useCurrentUser from "./useCurrentUser";

type UserLibraryStore = {
  library: Map<string, boolean> | null;
  recommended: Map<string, boolean> | null;
  setLibrary: (library: Map<string, boolean>) => void;
  setRecommended: (recommended: Map<string, boolean>) => void;
};

const useUserLibraryStore = createWithEqualityFn<UserLibraryStore>((set) => ({
  library: null,
  recommended: null,
  setLibrary: (library: Map<string, boolean>) => set({ library }),
  setRecommended: (recommended: Map<string, boolean>) => set({ recommended }),
}));

const useUserLibrary = (trackId: string) => {
  const currentUser = useCurrentUser();

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

export const useUserRecommended = (trackId: string) => {
  const currentUser = useCurrentUser();

  if (!useUserLibraryStore.getState().recommended && currentUser?.recommended) {
    const recommended = currentUser.recommended;
    if (recommended) {
      useUserLibraryStore.setState((prev) => ({
        ...prev,
        recommended: new Map(recommended.map(({ trackId }) => [trackId, true])),
      }));
    }
  }

  const recommended = useUserLibraryStore(
    (state) => state.recommended,
    shallow,
  );
  const setRecommended = useUserLibraryStore((state) => state.setRecommended);

  const toggleRecommend = () => {
    const newReommendedMap = new Map(recommended);
    newReommendedMap.set(trackId, !newReommendedMap.get(trackId));
    setRecommended(newReommendedMap);
  };

  const isRecommendedFn = () => {
    if (!recommended) return false;
    return !!recommended.get(trackId);
  };

  const isRecommended = isRecommendedFn();

  return { isRecommended, toggleRecommend };
};

export default useUserLibrary;
