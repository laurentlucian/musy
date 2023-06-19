import { Flex, HStack, SimpleGrid, Stack, Text } from '@chakra-ui/react';

import ActivityUserInfo from '~/components/activity/shared/ActivityUserInfo';
import TilePlaybackTracksImage, {
  getPlaybackTracks,
} from '~/components/tile/playback/inactive/TilePlaybackTracksImage';
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
              LISTENED FOR{' '}
              {timeBetween({
                endDate: user.playbacks[0].endedAt,
                startDate: user.playbacks[0].startedAt,
              })}
            </Text>
          </HStack>
        </Flex>
        <TilePlaybackTracksImage
          tracks={getPlaybackTracks(user)}
          fullscreen={{ originUserId: user.userId }}
          w="65%"
        />
      </Stack>
      <Flex direction="column" flexGrow={1} overflowX="hidden" pt="8px">
        <PlaybackAddAll />
      </Flex>
    </SimpleGrid>
  );
};

export default FullscreenPlaybackInactive;
