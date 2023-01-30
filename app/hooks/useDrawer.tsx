import { useState } from 'react';

import { create } from 'zustand';
import { shallow } from 'zustand/shallow';

import type { Track } from '~/lib/types/types';

interface DrawerStateConfig {
  actions: {
    onClose: () => void;
    onOpen: (by: Track) => void;
    setIsPlaying: (by: boolean) => void;
  };
  isPlaying?: boolean;
  track: Track | null;
}

const useDrawerStore = create<DrawerStateConfig>()((set) => ({
  actions: {
    onClose: () => set({ isPlaying: false, track: null }),
    onOpen: (by) =>
      set({
        track: {
          albumName: by.albumName,
          albumUri: by.albumUri,
          artist: by.artist,
          artistUri: by.artistUri,
          explicit: by.explicit,
          image: by.image,
          link: by.link,
          name: by.name,
          preview_url: by.preview_url,
          trackId: by.trackId,
          uri: by.uri,
          userId: by.userId,
        },
      }),
    setIsPlaying: (by) => set({ isPlaying: by }),
  },
  isPlaying: false,
  track: null,
}));

export const useDrawerTrack = () =>
  useDrawerStore(
    (state) => state.track,
    // by default, zustand checks if state changes with a strict equality check
    // this means that if you have an object in state, it would always be considered changed
    // a shallow comparison is used for objects
    shallow,
  );
export const useDrawerIsPlaying = () =>
  useDrawerStore(
    (state) => state.isPlaying,
    // by default, zustand checks if state changes with a strict equality check
    // this means that if you have an object in state, it would always be considered changed
    // a shallow comparison is used for objects
    shallow,
  );

export const useDrawerActions = () => useDrawerStore((state) => state.actions);

export const useClickDrag = () => {
  const { onOpen } = useDrawerActions();
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isMouseDragged, setIsMouseDragged] = useState(false);

  const handleMouseDown = () => {
    setIsMouseDown(true);
  };

  const handleMouseMove = () => {
    if (isMouseDown) {
      setIsMouseDragged(true);
    }
  };

  const handleClick = (track: Track) => {
    if (!isMouseDragged) {
      onOpen(track);
    }
    setIsMouseDown(false);
    setIsMouseDragged(false);
  };

  return {
    onClick: handleClick,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
  };
};
