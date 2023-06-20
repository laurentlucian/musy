import { Flex, HStack, SimpleGrid, Stack, Text } from '@chakra-ui/react';

import ActivityUserInfo from '~/components/activity/shared/ActivityUserInfo';
import TilePlaybackTracksImage from '~/components/tile/playback/inactive/TilePlaybackTracksImage';
import usePlaybackTracks from '~/hooks/usePlaybackTracks';
import Waver from '~/lib/icons/Waver';
import type { ProfileWithInfo } from '~/lib/types/types';
import { timeBetween } from '~/lib/utils';

import PlaybackAddAll from './PlaybackAddAll';

const FullscreenPlaybackInactive = ({ user }: { user: ProfileWithInfo }) => {
  const tracks = usePlaybackTracks(user);

  const timeListened = (
    <Text fontSize="10px" fontWeight="bolder" textTransform="uppercase">
      LISTENED FOR{' '}
      {timeBetween({
        endDate: user.playbacks[0].endedAt,
        startDate: user.playbacks[0].startedAt,
      })}
    </Text>
  );

  if (!tracks)
    return (
      <Stack w="100%" justify="center" align="center">
        {timeListened}
        <Waver />
      </Stack>
    );

  return (
    <SimpleGrid columns={[1, 2]} overflow="hidden" alignContent={['start', 'center']}>
      <Stack align={['center', 'start']} mt={['50px', '0px']} mx="auto">
        <Flex justify="space-between" w="65%" mt={['0', '-42px']} id="dont-close">
          <ActivityUserInfo user={user} />
          <HStack align="center">{timeListened}</HStack>
        </Flex>
        <TilePlaybackTracksImage
          tracks={tracks}
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
