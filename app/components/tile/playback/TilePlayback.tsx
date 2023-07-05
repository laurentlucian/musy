import { Link } from '@remix-run/react';

import { Stack, Link as ChakraLink } from '@chakra-ui/react';

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
      box={{ w: '200px' }}
      fullscreen={{
        originUserId: user.userId,
        track: playback.track,
      }}
      image={{
        src: playback.track.image,
      }}
    />
  ) : (
    <TilePlaybackTracksImage tracks={[]} w="200px" />
  );

  const info = playback ? <TileTrackInfo track={playback.track} maxW="200px" /> : null;

  return (
    <Stack key={index} flexShrink={0}>
      {tile && <ActivityUserInfo user={user} />}
      <Tile
        image={tile ? image : <TilePlaybackUser user={user} />}
        info={
          tile ? (
            info
          ) : (
            <ChakraLink as={Link} to={`/${user.userId}`} mx="auto" fontSize={['12px', '14px']}>
              {user.name}
            </ChakraLink>
          )
        }
      />
    </Stack>
  );
};

export default TilePlayback;
