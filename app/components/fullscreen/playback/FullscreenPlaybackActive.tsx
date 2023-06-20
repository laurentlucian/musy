import { Flex, HStack, Icon, SimpleGrid, Stack, Text } from '@chakra-ui/react';

import { AnimatePresence, motion } from 'framer-motion';
import { Sound } from 'iconsax-react';

import ActivityTrackInfo from '~/components/activity/shared/ActivityTrackInfo';
import ActivityUserInfo from '~/components/activity/shared/ActivityUserInfo';
import TileTrackImage from '~/components/tile/track/TileTrackImage';
import Tiles from '~/components/tiles/Tiles';
import usePlaybackTracks from '~/hooks/usePlaybackTracks';
import type { ProfileWithInfo } from '~/lib/types/types';
import { timeBetween } from '~/lib/utils';

import AddToUserQueue from '../shared/actions/AddToUserQueue';
import ViewTrack from '../shared/actions/ViewTrack';
import PlaybackListenAlong from './PlaybackListenAlong';

const FullscreenPlaybackActive = ({ user }: { user: ProfileWithInfo }) => {
  if (!user.playback) throw new Error('User has no playback');
  const tracks = usePlaybackTracks(user);
  const tracksWithoutCurrentPlayback = tracks?.slice(1);
  const track = user.playback.track;

  return (
    <SimpleGrid columns={[1, 2]} overflow="hidden" alignContent={['start', 'center']}>
      <Stack align={['center', 'start']} mt={['50px', '0px']} mx="auto">
        <Flex justify="space-between" w="65%" mt={['0', '-42px']} id="dont-close">
          <ActivityUserInfo user={user} />
          <HStack align="center">
            <Text fontSize="10px" fontWeight="bolder" textTransform="uppercase">
              LISTENING FOR{' '}
              {timeBetween({
                endDate: new Date(),
                startDate: user.playback.createdAt,
              })}
            </Text>
            <Icon as={Sound} boxSize="20px" />
          </HStack>
        </Flex>

        <Stack w="65%">
          <TileTrackImage
            fullscreen={{
              originUserId: user.userId,
              track,
            }}
            image={{
              src: track.image,
            }}
          />
          <ActivityTrackInfo track={track} />
        </Stack>
      </Stack>
      <Flex direction="column" flexGrow={1} overflowX="hidden" pt="8px">
        {/* <PlaybackListenAlong />
        <AddToUserQueue userId={user.userId} />
        <ViewTrack track={track} userId={user.userId} /> */}
        <AnimatePresence>
          {!!tracksWithoutCurrentPlayback?.length && (
            <motion.div // no needed because tiletrackimage already has opacity animation
              initial={{ opacity: 0 }} // but this motion.div is preventing layout shift
              animate={{ opacity: 1 }}
              transition={{ duration: '1' }}
            >
              <Tiles title="RECENT">
                {tracksWithoutCurrentPlayback.map((track, index) => (
                  <Stack key={index}>
                    <TileTrackImage
                      box={{ w: '200px' }}
                      image={{ src: track.image }}
                      fullscreen={{
                        originUserId: user.userId,
                        track,
                      }}
                    />
                    <ActivityTrackInfo track={track} />
                  </Stack>
                ))}
              </Tiles>
            </motion.div>
          )}
        </AnimatePresence>
      </Flex>
    </SimpleGrid>
  );
};

export default FullscreenPlaybackActive;
