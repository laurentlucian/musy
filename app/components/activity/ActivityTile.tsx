import { Stack, Flex, Text } from '@chakra-ui/react';

import useUsers from '~/hooks/useUsers';
import SpotifyLogo from '~/lib/icons/SpotifyLogo';
import type { Activity } from '~/lib/types/types';
import { timeSince } from '~/lib/utils';

import TilePlaybackTracksImage from '../tile/playback/inactive/TilePlaybackTracksImage';
import TileTrackImage from '../tile/track/TileTrackImage';
import TileTrackInfo from '../tile/track/TileTrackInfo';
import ActivityInfo from './shared/ActivityInfo';
import ActivityTrackInfo from './shared/ActivityTrackInfo';

const TileActivityPlayback = ({ activity }: { activity: Activity }) => {
  const users = useUsers();
  const user = users.find((u) => u.userId === activity.userId);
  if (!user || !activity.tracks?.length) return null;

  return (
    <Stack alignSelf="center" w="100%" maxW="640px">
      <ActivityInfo activity={activity} />
      <Flex pb="5px" w="100%">
        <Stack spacing="5px" w="100%">
          <TilePlaybackTracksImage
            tracks={activity.tracks}
            fullscreen={{ originUserId: user.userId }}
            maxW="640px"
          />

          {activity.createdAt && (
            <Text fontSize={['8px', '9px']} opacity={0.6} w="100%">
              {timeSince(activity.createdAt)}
            </Text>
          )}
          <SpotifyLogo icon w="21px" h="21px" />
        </Stack>
      </Flex>
    </Stack>
  );
};

const ActivityTile = ({ activity }: { activity: Activity }) => {
  const track = activity.track;

  if (!track) return <TileActivityPlayback activity={activity} />;

  return (
    <Stack alignSelf="center" w="100%" maxW="640px">
      <ActivityInfo activity={activity} />
      <Flex pb="5px" w="100%">
        <Stack spacing="5px" w="100%">
          <Stack>
            <TileTrackImage
              fullscreen={{
                originUserId: activity.userId,
                track,
              }}
              image={{
                src: track.image,
              }}
            />

            <ActivityTrackInfo track={track} />
          </Stack>

          <TileTrackInfo track={track} createdAt={activity.createdAt} icon={false} />
        </Stack>
      </Flex>
    </Stack>
  );
};

export default ActivityTile;
