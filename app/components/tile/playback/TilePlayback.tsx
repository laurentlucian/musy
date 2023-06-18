import { Link } from '@remix-run/react';

import { Stack, Link as ChakraLink, SimpleGrid } from '@chakra-ui/react';

import ActivityUserInfo from '~/components/activity/shared/ActivityUserInfo';
import TilePlaybackUser from '~/components/tile/playback/TilePlaybackUser';
import type { ProfileWithInfo } from '~/lib/types/types';

import Tile from '../Tile';
import TileTrackImage from '../track/TileTrackImage';
import TileTrackInfo from '../track/TileTrackInfo';

type TilesPlaybackProps = {
  index: number;
  tile: boolean;
  user: ProfileWithInfo;
};

const TilePlayback = ({ index, tile, user }: TilesPlaybackProps) => {
  const { playback } = user;

  const image = playback ? (
    <TileTrackImage
      fullscreen={{
        originUserId: user.userId,
        track: playback.track,
      }}
      image={{
        src: playback.track.image,
      }}
    />
  ) : (
    <SimpleGrid columns={2}>
      {user.recent.map(({ track }, index) => (
        <TileTrackImage
          key={index}
          image={{
            src: track.image,
          }}
        />
      ))}
    </SimpleGrid>
  );

  const info = playback ? <TileTrackInfo track={playback.track} /> : null;

  return (
    <Stack key={index} flexShrink={0}>
      {tile && <ActivityUserInfo user={user} />}
      <Tile
        w="200px"
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
