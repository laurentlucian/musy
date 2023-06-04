import { Stack } from '@chakra-ui/react';

import type { TrackWithInfo } from '~/lib/types/types';

import Tile from './tile/Tile';
import TileImage from './tile/TileImage';
import TileInfo from './tile/TileInfo';
import Tiles from './Tiles';

const TrackTiles = ({
  actions,
  title,
  tracks,
}: {
  actions?: { tile?: React.ReactNode; tiles?: React.ReactNode };
  title: string;
  tracks: TrackWithInfo[];
}) => {
  const scrollButtons = tracks.length > 5;

  if (!tracks.length) return null;

  return (
    <Stack spacing={1}>
      <Tiles title={title} scrollButtons={scrollButtons} action={actions?.tiles} tracks={tracks}>
        {tracks.map((track, index) => {
          const layoutKey = title + index;
          return (
            <Tile
              key={index}
              track={track}
              tracks={tracks}
              index={index}
              layoutKey={layoutKey}
              image={<TileImage />}
              info={<TileInfo />}
              action={actions?.tile}
            />
          );
        })}
      </Tiles>
    </Stack>
  );
};

export default TrackTiles;
