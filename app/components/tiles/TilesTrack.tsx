import { useParams } from '@remix-run/react';

import { Stack } from '@chakra-ui/react';

import type { TrackWithInfo } from '~/lib/types/types';

import { useFullscreen } from '../fullscreen/Fullscreen';
import FullscreenTrack from '../fullscreen/track/FullscreenTrack';
import Tile from '../tile/Tile';
import TileTrackImage from '../tile/track/TileTrackImage';
import TileTrackInfo from '../tile/track/TileTrackInfo';
import Tiles from './Tiles';

const TilesTrack = ({
  actions,
  title,
  tracks,
}: {
  actions?: { tile?: React.ReactNode; tiles?: React.ReactNode };
  title: string;
  tracks: TrackWithInfo[];
}) => {
  const { id } = useParams();
  const { onClick, onMouseDown, onMouseMove } = useFullscreen();
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
              image={
                <TileTrackImage
                  box={{ w: '200px' }}
                  image={{
                    cursor: 'pointer',
                    onClick: () => {
                      onClick(<FullscreenTrack track={track} originUserId={id} />);
                    },
                    onMouseDown,
                    onMouseMove,
                    src: track.image,
                  }}
                />
              }
              info={<TileTrackInfo track={track} />}
              action={actions?.tile}
            />
          );
        })}
      </Tiles>
    </Stack>
  );
};

export default TilesTrack;
