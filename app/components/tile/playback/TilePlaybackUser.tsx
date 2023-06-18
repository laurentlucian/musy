import { Box, Image, Stack, Text } from '@chakra-ui/react';

import { useFullscreen } from '~/components/fullscreen/Fullscreen';
import FullscreenPlayback from '~/components/fullscreen/playback/FullscreenPlayback';
import type { ProfileWithInfo } from '~/lib/types/types';
import { timeSince } from '~/lib/utils';

import TileTrackImage from '../track/TileTrackImage';
import TilePlaybackTracksImage, { getPlaybackTracks } from './inactive/TilePlaybackTracksImage';

const TilePlaybackUser = ({ user }: { user: ProfileWithInfo }) => {
  const { onOpen } = useFullscreen();

  return (
    <Box
      mr="10px" // make tiles spacing dynamic
      pos="relative"
      w={['150px', '180px']}
      h={['150px', '180px']}
      overflow="hidden"
      border={['2px solid', '3px solid']}
      cursor="pointer"
      borderColor={user.playback ? 'white !important' : 'rgba(255, 255, 255, .5) !important'}
      borderRadius="50%"
      onClick={(e) => {
        e.preventDefault();
        onOpen(<FullscreenPlayback user={user} />);
      }}
      data-group
    >
      <Image
        minW={['150px', '180px']}
        maxW={['150px', '180px']}
        minH={['150px', '180px']}
        maxH={['150px', '180px']}
        objectFit="cover"
        src={user.image}
      />
      <Box
        pos="absolute"
        top={0}
        right={0}
        left={0}
        bottom={0}
        borderRadius="50%"
        border="3px solid black"
      />
      <Stack
        spacing={1}
        opacity={[1, 0]}
        _groupHover={{ opacity: 1 }}
        transition="opacity 0.14s linear"
        direction="column"
        pos="absolute"
        top={0}
        right={0}
        left={0}
        bottom={0}
        justify="center"
        align="center"
        bg="#10101066"
        backdropFilter={['blur(2px)', 'blur(6px)']}
      >
        {user.playback ? (
          <TileTrackImage
            box={{
              w: ['85px', '100px'],
            }}
            image={{ src: user.playback?.track.image }}
          />
        ) : (
          <TilePlaybackTracksImage tracks={getPlaybackTracks(user)} w={['85px', '100px']} />
        )}
        <Text noOfLines={1} fontSize={['9px', '12px']} maxW={['90px', '110px']} color="white">
          {user.playback?.track.artist ?? timeSince(user.playbacks[0]?.endedAt)}
        </Text>
      </Stack>
    </Box>
  );
};

export default TilePlaybackUser;
