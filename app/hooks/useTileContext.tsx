import { createContext, useContext } from 'react';

import type { TrackWithUsers } from '~/lib/types/types';

const TileContext = createContext<{
  index: number;
  layoutKey: string;
  track: TrackWithUsers;
  tracks: TrackWithUsers[];
} | null>(null);

export function useTileContext() {
  const context = useContext(TileContext);
  if (!context) {
    throw new Error('Tile.* component muse be rendered as a child of Tile component');
  }
  return context;
}

export default TileContext;
