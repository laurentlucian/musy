import { useState } from 'react';

import type { Profile, Track } from '@prisma/client';
import { create } from 'zustand';
import { shallow } from 'zustand/shallow';

import { useSetExpandedStack } from './useOverlay';

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
    onOpen: (
      by: DrawerTrack,
      fromId: string | null,
      layoutKey: string | null,
      tracks: Track[],
      index: number,
    ) => void;
    setIsPlaying: (by: boolean) => void;
  };
  fromId: string | null;
  index: number;
  isPlaying?: boolean;
  layoutKey: string | null;
  track: DrawerTrack | null;
  tracks: Track[] | [];
}

const useDrawerStore = create<DrawerStateConfig>()((set) => ({
  actions: {
    onClose: () => set({ isPlaying: false, track: null }),
    onOpen: (track, fromId, layoutKey, tracks, index) =>
      set({
        fromId,
        index,
        layoutKey,
        track,
        tracks,
      }),
    setIsPlaying: (by) => set({ isPlaying: by }),
  },
  fromId: null,
  index: 0,
  isPlaying: false,
  layoutKey: null,
  track: null,
  tracks: [],
}));

export const useDrawerTrack = () =>
  useDrawerStore(
    (state) => state.track,
    // by default, zustand checks if state changes with a strict equality check
    // this means that if you have an object in state, it would always be considered changed
    // a shallow comparison is used for objects
    shallow,
  );
export const useDrawerTracks = () => useDrawerStore((state) => state.tracks, shallow);
export const useDrawerIsPlaying = () => useDrawerStore((state) => state.isPlaying, shallow);
export const useDrawerFromId = () => useDrawerStore((state) => state.fromId, shallow);
export const useDrawerLayoutKey = () => useDrawerStore((state) => state.layoutKey, shallow);
export const useDrawerTrackIndex = () => useDrawerStore((state) => state.index, shallow);

export const useDrawerActions = () => useDrawerStore((state) => state.actions);

export const useClickDrag = () => {
  const { onOpen } = useDrawerActions();
  const { addToStack } = useSetExpandedStack();
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

  const handleClick = (
    track: Track,
    fromId: string | null,
    layoutKey: string,
    tracks: Track[] | [],
    index: number,
  ) => {
    if (!isMouseDragged) {
      addToStack(1);
      onOpen(track, fromId, layoutKey, tracks, index);
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
