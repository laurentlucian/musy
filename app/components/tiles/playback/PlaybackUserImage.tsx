import { Box, Image, Stack, Text } from '@chakra-ui/react';

import type { Playback } from '@prisma/client';

import { useFullscreen } from '~/components/fullscreen/Fullscreen';
import FullscreenPlayback from '~/components/fullscreen/playback/FullscreenPlayback';
import type { ProfileWithInfo, TrackWithInfo } from '~/lib/types/types';

export type ProfileWithPlayback = Omit<ProfileWithInfo, 'playback'> & {
  playback: Playback & {
    track: TrackWithInfo;
  };
};

const PlaybackUserImage = ({ user }: { user: ProfileWithPlayback }) => {
  const { onOpen } = useFullscreen();

  return (
    <Box
      mr="10px" // make tiles spacing dynamic
      pos="relative"
      w={['110px', '180px']}
      h={['110px', '180px']}
      overflow="hidden"
      border={user.playback ? ['2px solid', '3px solid'] : undefined}
      cursor={user.playback ? 'pointer' : undefined}
      borderColor="white"
      borderRadius="50%"
      onClick={(e) => {
        e.preventDefault();
        onOpen(<FullscreenPlayback user={user} />);
      }}
      data-group
    >
      <Image
        minW={['110px', '180px']}
        maxW={['110px', '180px']}
        minH={['110px', '180px']}
        maxH={['110px', '180px']}
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
        display={['flex', 'none']}
        _groupHover={{ display: 'flex' }}
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
        <Image
          minW={['50px', '100px']}
          maxW={['50px', '100px']}
          minH={['50px', '100px']}
          maxH={['50px', '100px']}
          src={user.playback?.track.image}
        />
        <Text noOfLines={1} fontSize={['9px', '12px']} maxW={['90px', '110px']} color="white">
          {user.playback?.track.artist}
        </Text>
      </Stack>
    </Box>
  );
};

export default PlaybackUserImage;
