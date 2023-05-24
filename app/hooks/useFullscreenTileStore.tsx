import { useState } from 'react';

import { wrap } from 'framer-motion';
import { create } from 'zustand';
import { shallow } from 'zustand/shallow';

import type { TrackWithInfo } from '~/lib/types/types';

import { useSetExpandedStack } from './useOverlay';

interface ExpandedStateConfig {
  actions: {
    onClose: () => void;
    onOpen: (
      by: TrackWithInfo,
      fromId: string | null,
      layoutKey: string | null,
      tracks: TrackWithInfo[],
      index: number,
    ) => void;
    setIsPlaying: (by: boolean) => void;
  };
  fromId: string | null;
  index: number;
  isPlaying?: boolean;
  layoutKey: string | null;
  track: TrackWithInfo | null;
  tracks: TrackWithInfo[] | [];
}

const useFullscreenStore = create<ExpandedStateConfig>()((set) => ({
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

export const useFullscreenTileStore = () =>
  useFullscreenStore(
    (state) => state.track,
    // by default, zustand checks if state changes with a strict equality check
    // this means that if you have an object in state, it would always be considered changed
    // a shallow comparison is used for objects
    shallow,
  );

export const useFullscreenTiles = () => useFullscreenStore((state) => state.tracks, shallow);
export const useFullscreenIsPlaying = () => useFullscreenStore((state) => state.isPlaying, shallow);
export const useFullscreenFromId = () => useFullscreenStore((state) => state.fromId, shallow);
export const useFullscreenLayoutKey = () => useFullscreenStore((state) => state.layoutKey, shallow);
export const useFullscreenTileIndex = () => useFullscreenStore((state) => state.index, shallow);

export const useFullscreenTileTrack = (page: number) => {
  const tracks = useFullscreenTiles();
  const originalIndex = useFullscreenTileIndex();
  const index = wrap(0, tracks.length, page + originalIndex);
  const track = tracks[index];

  return track;
};

export const useFullscreenActions = () => useFullscreenStore((state) => state.actions);

export const useClickDrag = () => {
  const { onOpen } = useFullscreenActions();
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
    track: TrackWithInfo,
    fromId: string | null,
    layoutKey: string,
    tracks: TrackWithInfo[] | [],
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
