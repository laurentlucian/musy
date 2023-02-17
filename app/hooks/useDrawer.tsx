import { useState } from 'react';

import type { Profile, Track } from '@prisma/client';
import { create } from 'zustand';
import { shallow } from 'zustand/shallow';

type DrawerTrack = Track & {
  liked?: {
    user: Profile;
  }[];
  recent?: {
    user: Profile;
  }[];
};
interface DrawerStateConfig {
  actions: {
    onClose: () => void;
    onOpen: (by: DrawerTrack, fromId: string) => void;
    setIsPlaying: (by: boolean) => void;
  };
  fromId: string | null;
  isPlaying?: boolean;
  track: DrawerTrack | null;
}

const useDrawerStore = create<DrawerStateConfig>()((set) => ({
  actions: {
    onClose: () => set({ isPlaying: false, track: null }),
    onOpen: (track, fromId) =>
      set({
        fromId,
        track,
      }),
    setIsPlaying: (by) => set({ isPlaying: by }),
  },
  fromId: null,
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
export const useDrawerFromId = () =>
  useDrawerStore(
    (state) => state.fromId,
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

  const handleClick = (track: Track, fromId: string) => {
    if (!isMouseDragged) {
      onOpen(track, fromId);
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
