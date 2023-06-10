import { Flex, HStack, Icon, SimpleGrid, Stack, Text } from '@chakra-ui/react';

import type { Playback, Track } from '@prisma/client';
import { Sound } from 'iconsax-react';

import ActivityTrackInfo from '~/components/activity/shared/ActivityTrackInfo';
import ActivityUserInfo from '~/components/activity/shared/ActivityUserInfo';
import TileTrackImage from '~/components/tile/track/TileTrackImage';
import type { ProfileWithInfo } from '~/lib/types/types';

import { useFullscreen } from '../Fullscreen';
import AddToUserQueue from '../shared/actions/AddToUserQueue';
import FullscreenFadeLayout from '../shared/FullscreenFadeLayout';
import TrackInfo from '../shared/FullscreenTrackInfo';
import FullscreenTrack from '../track/FullscreenTrack';
import PlaybackListenAlong from './PlaybackListenAlong';

type ProfileWithPlayback = Omit<ProfileWithInfo, 'playback'> & {
  playback: Playback & {
    track: Track;
  };
};

const FullscreenPlayback = (props: { user: ProfileWithPlayback }) => {
  const { onOpen } = useFullscreen();
  const user = props.user;
  const track = user.playback.track;

  return (
    <FullscreenFadeLayout>
      <SimpleGrid columns={[1, 2]} overflow="hidden" alignContent={['start', 'center']}>
        <Stack align={['center', 'start']} mt={['50px', '0px']} mx="auto" id="dont-close">
          <Flex justify="space-between" w="65%" mt={['0', '-42px']}>
            <ActivityUserInfo user={user} />
            <HStack align="center">
              <Text fontSize="10px" fontWeight="bolder">
                LISTENING
              </Text>
              <Icon as={Sound} boxSize="20px" />
            </HStack>
          </Flex>

          <Stack w="65%">
            <TileTrackImage
              image={{
                cursor: 'pointer',
                onClick: () => onOpen(<FullscreenTrack track={track} originUserId={user.userId} />),
                src: track.image,
              }}
            />
            <ActivityTrackInfo track={track} />
            <TrackInfo track={track} />
          </Stack>
        </Stack>
        <Flex direction="column" flexGrow={1} overflowX="hidden">
          <PlaybackListenAlong />
          <AddToUserQueue userId={user.userId} />
        </Flex>
      </SimpleGrid>
    </FullscreenFadeLayout>
  );
};

export default FullscreenPlayback;
