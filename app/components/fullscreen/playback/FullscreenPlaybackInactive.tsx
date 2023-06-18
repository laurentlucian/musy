import { Flex, HStack, SimpleGrid, Stack, Text } from '@chakra-ui/react';

import ActivityUserInfo from '~/components/activity/shared/ActivityUserInfo';
import TileTrackImage from '~/components/tile/track/TileTrackImage';
import type { ProfileWithInfo } from '~/lib/types/types';
import { timeBetween } from '~/lib/utils';

import PlaybackAddAll from './PlaybackAddAll';

const FullscreenPlaybackInactive = ({ user }: { user: ProfileWithInfo }) => {
  return (
    <SimpleGrid columns={[1, 2]} overflow="hidden" alignContent={['start', 'center']}>
      <Stack align={['center', 'start']} mt={['50px', '0px']} mx="auto">
        <Flex justify="space-between" w="65%" mt={['0', '-42px']} id="dont-close">
          <ActivityUserInfo user={user} />
          <HStack align="center">
            <Text fontSize="10px" fontWeight="bolder" textTransform="uppercase">
              LISTENED FOR {timeBetween(user.playbacks[0]?.startedAt, user.playbacks[0]?.endedAt)}
            </Text>
          </HStack>
        </Flex>
        <SimpleGrid columns={2} w="65%">
          {user.recent.map(({ track }, index) => (
            <TileTrackImage
              fullscreen={{
                originUserId: user.userId,
                track,
              }}
              key={index}
              image={{
                src: track.image,
              }}
            />
          ))}
        </SimpleGrid>
      </Stack>
      <Flex direction="column" flexGrow={1} overflowX="hidden" pt="8px">
        <PlaybackAddAll />
      </Flex>
    </SimpleGrid>
  );
};

export default FullscreenPlaybackInactive;
