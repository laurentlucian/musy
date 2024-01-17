import { useParams } from '@remix-run/react';

import type { TrackWithInfo } from '~/lib/types/types';

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
  const scrollButtons = tracks.length > 5;

  if (!tracks.length) return null;

  return (
    <div className='stack-h-1'>
      <Tiles title={title} scrollButtons={scrollButtons} action={actions?.tiles} tracks={tracks}>
        {tracks.map((track, index) => {
          return (
            <Tile
              key={index}
              image={
                <TileTrackImage
                  box='w-[200px] h-[200px] fade-in'
                  fullscreen={{ originUserId: id, track }}
                  image={{
                    src: track.image,
                  }}
                />
              }
              info={<TileTrackInfo track={track} className='max-w-[200px]' />}
            />
          );
        })}
      </Tiles>
    </div>
  );
};

export default TilesTrack;
