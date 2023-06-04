import { createContext, useContext } from 'react';

import { SimpleGrid, Stack } from '@chakra-ui/react';

import type { Playback, Track } from '@prisma/client';

import type { ProfileWithInfo } from '~/lib/types/types';

import TrackImage from '../shared/TrackImage';
import TrackInfo from '../shared/TrackInfo';

type ProfileWithPlayback = Omit<ProfileWithInfo, 'playback'> & {
  playback: Playback & {
    track: Track;
  };
};

export const FullscreenPlayerContext = createContext<{
  user: ProfileWithPlayback;
} | null>(null);

export const useFullscreenPlayer = () => {
  const context = useContext(FullscreenPlayerContext);
  if (!context) {
    throw new Error('Must be a child of FullscreenPlayer to useFullscreenPlayer');
  }
  return context;
};

const FullscreenPlayer = (props: { user: ProfileWithPlayback }) => {
  const track = props.user.playback.track;

  return (
    <FullscreenPlayerContext.Provider value={{ user: props.user }}>
      <SimpleGrid columns={[1, 2]} overflow="hidden">
        <Stack align={['center', 'start']} mt={['50px', '0px']} mx="auto">
          <TrackImage track={track} />
          <TrackInfo track={track} />
        </Stack>
      </SimpleGrid>
    </FullscreenPlayerContext.Provider>
  );
};

export default FullscreenPlayer;
