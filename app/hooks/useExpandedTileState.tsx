import { useState } from 'react';

import type { Profile, Track } from '@prisma/client';
import { create } from 'zustand';
import { shallow } from 'zustand/shallow';

import type { TrackWithUsers } from '~/lib/types/types';

import { useSetExpandedStack } from './useOverlay';

type ExpandedTile = Track & {
  liked?: {
    user: Profile;
  }[];
  recent?: {
    user: Profile;
  }[];
};
interface ExpandedStateConfig {
  actions: {
    onClose: () => void;
    onOpen: (
      by: ExpandedTile,
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
  track: ExpandedTile | null;
  tracks: TrackWithUsers[] | [];
}

const useExpandedStore = create<ExpandedStateConfig>()((set) => ({
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

export const useExpandedTile = () =>
  useExpandedStore(
    (state) => state.track,
    // by default, zustand checks if state changes with a strict equality check
    // this means that if you have an object in state, it would always be considered changed
    // a shallow comparison is used for objects
    shallow,
  );
export const useExpandedTiles = () => useExpandedStore((state) => state.tracks, shallow);
export const useExpandedIsPlaying = () => useExpandedStore((state) => state.isPlaying, shallow);
export const useExpandedFromId = () => useExpandedStore((state) => state.fromId, shallow);
export const useExpandedLayoutKey = () => useExpandedStore((state) => state.layoutKey, shallow);
export const useExpandedTileIndex = () => useExpandedStore((state) => state.index, shallow);

export const useExpandedActions = () => useExpandedStore((state) => state.actions);

export const useClickDrag = () => {
  const { onOpen } = useExpandedActions();
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
