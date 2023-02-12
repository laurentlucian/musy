import { useState } from 'react';

import { create } from 'zustand';
import { shallow } from 'zustand/shallow';

import type { Track } from '~/lib/types/types';

interface DrawersStateConfig {
  actions: {
    onClose: () => void;
    onOpen: (by: Track[]) => void;
    setIsPlaying: (by: boolean) => void;
  };
  isPlaying?: boolean;
  tracks: Track[] | null;
}

const useDrawersStore = create<DrawersStateConfig>()((set) => ({
  actions: {
    onClose: () => set({ isPlaying: false, tracks: null }),
    onOpen: (by) => set({ tracks: by }),
    setIsPlaying: (by) => set({ isPlaying: by }),
  },
  isPlaying: false,
  tracks: null,
}));

export const useDrawerTrack = () => useDrawersStore((state) => state.tracks, shallow);
export const useDrawerIsPlaying = () => useDrawersStore((state) => state.isPlaying, shallow);

export const useDrawersActions = () => useDrawersStore((state) => state.actions);

export const useClickDrag = () => {
  const { onOpen } = useDrawersActions();
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
      onOpen([track]);
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
