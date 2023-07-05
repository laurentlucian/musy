import { Stack, Flex } from '@chakra-ui/react';

import type { Activity } from '~/lib/types/types';

import TileTrackImage from '../tile/track/TileTrackImage';
import TileTrackInfo from '../tile/track/TileTrackInfo';
import ActivityInfo from './shared/ActivityInfo';
import ActivityTrackInfo from './shared/ActivityTrackInfo';

const ActivityTile = ({ activity }: { activity: Activity }) => {
  const track =
    activity.liked?.track ||
    activity.queue?.track ||
    activity.recommend?.track ||
    activity.playlist?.track;

  if (!track) return null;

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
