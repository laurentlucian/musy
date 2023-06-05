import { Link } from '@remix-run/react';
import { useState } from 'react';

import { Link as ChakraLink, Stack, Switch } from '@chakra-ui/react';

import type { Playback } from '@prisma/client';

import ActivityUserInfo from '~/components/activity/shared/ActivityUserInfo';
import { useFullscreen } from '~/components/fullscreen/Fullscreen';
import FullscreenTrack from '~/components/fullscreen/track/FullscreenTrack';
import Tile from '~/components/tile/Tile';
import TileTrackImage from '~/components/tile/track/TileTrackImage';
import TileTrackInfo from '~/components/tile/track/TileTrackInfo';
import type { ProfileWithInfo, TrackWithInfo } from '~/lib/types/types';

import PlaybackUserImage from './playback/PlaybackUserImage';
import Tiles from './Tiles';

export type ProfileWithPlayback = Omit<ProfileWithInfo, 'playback'> & {
  playback: Playback & {
    track: TrackWithInfo;
  };
};

type TilesPlaybackProps = {
  title: string;
  users: ProfileWithPlayback[];
};

const TilesPlayback = ({ title, users }: TilesPlaybackProps) => {
  const [tile, setTile] = useState(false);
  const { onOpen } = useFullscreen();
  const scrollButtons = users.length > 5;

  if (!users.length) return null;

  const tracks = users.map(({ playback }) => playback.track);

  return (
    <Stack spacing={1}>
      <Tiles
        title={title}
        scrollButtons={scrollButtons}
        action={
          <Switch size="sm" ml="10px" colorScheme="whiteAlpha" onChange={() => setTile(!tile)} />
        }
        tracks={tracks}
      >
        {users.map(({ playback, ...user }, index) => {
          const layoutKey = title + index;

          return (
            <Stack key={index}>
              {tile && <ActivityUserInfo user={user} />}
              <Tile
                track={playback.track}
                tracks={tracks}
                index={index}
                layoutKey={layoutKey}
                image={
                  tile ? (
                    <TileTrackImage
                      image={{
                        cursor: 'pointer',
                        onClick: () =>
                          onOpen(
                            <FullscreenTrack track={playback.track} originUserId={user.userId} />,
                          ),
                        src: playback.track.image,
                      }}
                    />
                  ) : (
                    <PlaybackUserImage user={{ playback, ...user }} />
                  )
                }
                info={
                  tile ? (
                    <TileTrackInfo track={playback.track} />
                  ) : (
                    <ChakraLink
                      as={Link}
                      to={`/${user.userId}`}
                      mx="auto"
                      fontSize={['12px', '14px']}
                    >
                      {user.name}
                    </ChakraLink>
                  )
                }
              />
            </Stack>
          );
        })}
      </Tiles>
    </Stack>
  );
};

export default TilesPlayback;
