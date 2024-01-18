import { Link } from '@remix-run/react';

import ActivityUserInfo from '~/components/activity/shared/ActivityUserInfo';
import TilePlaybackUser from '~/components/tile/playback/TilePlaybackUser';
import type { ProfileWithInfo } from '~/lib/types/types';

import Tile from '../Tile';
import TileTrackImage from '../track/TileTrackImage';
import TileTrackInfo from '../track/TileTrackInfo';
import TilePlaybackTracksImage from './inactive/TilePlaybackTracksImage';

type TilesPlaybackProps = {
  index: number;
  tile: boolean;
  user: ProfileWithInfo;
};

const TilePlayback = ({ index, tile, user }: TilesPlaybackProps) => {
  const { playback } = user;

  if (!playback && tile) return null;

  const image = playback ? (
    <TileTrackImage
      box='w-[200px]'
      fullscreen={{
        originUserId: user.userId,
        track: playback.track,
      }}
      image={{
        src: playback.track.image,
      }}
    />
  ) : (
    <TilePlaybackTracksImage tracks={[]} imageTw='w-[200px]' />
  );

  const info = playback ? <TileTrackInfo track={playback.track} className='w-[200px]' /> : null;

  return (
    <div className='stack-3 flex-shrink-0' key={index}>
      {tile && <ActivityUserInfo user={user} />}
      <Tile
        image={tile ? image : <TilePlaybackUser user={user} />}
        info={
          tile ? (
            info
          ) : (
            <Link
              to={`/${user.userId}`}
              className='mx-auto text-[12px] hover:underline md:text-[14px]'
            >
              {user.name}
            </Link>
          )
        }
      />
    </div>
  );
};

export default TilePlayback;
