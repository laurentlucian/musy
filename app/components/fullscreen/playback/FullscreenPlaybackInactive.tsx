import { Flex, HStack, SimpleGrid, Stack, Text } from '@chakra-ui/react';

import { AnimatePresence, motion } from 'framer-motion';

import ActivityUserInfo from '~/components/activity/shared/ActivityUserInfo';
import TilePlaybackTracksImage from '~/components/tile/playback/inactive/TilePlaybackTracksImage';
import TileTrackImage from '~/components/tile/track/TileTrackImage';
import Tiles from '~/components/tiles/Tiles';
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

  if (!tracks || !tracks?.length)
    return (
      <Stack w="100%" justify="center" align="center">
        {timeListened}
        {tracks ? (
          <Text fontSize="10px" fontWeight="bolder" textTransform="uppercase">
            no songs found
          </Text>
        ) : (
          <Waver />
        )}
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
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: '1' }}
          >
            <Tiles>
              {tracks.slice(4).map((track, index) => (
                <TileTrackImage
                  key={index}
                  box={{ w: '180px' }}
                  image={{ src: track.image }}
                  fullscreen={{
                    originUserId: user.userId,
                    track,
                  }}
                />
              ))}
            </Tiles>
          </motion.div>
        </AnimatePresence>
        {/* <PlaybackAddAll /> */}
      </Flex>
    </SimpleGrid>
  );
};

export default FullscreenPlaybackInactive;
