import type { ReactNode } from 'react';

import { Image, Stack, Text, HStack, Box, Flex } from '@chakra-ui/react';
import type { ChakraProps } from '@chakra-ui/react';

import { useFullscreen } from '~/components/fullscreen/Fullscreen';
import FullscreenTrack from '~/components/fullscreen/track/FullscreenTrack';
import explicitImage from '~/lib/assets/explicit-solid.svg';
import SpotifyLogo from '~/lib/icons/SpotifyLogo';
import type { Track } from '~/lib/types/types';

type CardProps = {
  action?: ReactNode;
  ref?: (node: HTMLDivElement | null) => void;
  track: Track;
  userId: string;
} & ChakraProps;

const Card = ({ action, track, userId }: CardProps) => {
  const { onOpen } = useFullscreen();
  const drawerTrack = track;

  const SongTitle = (
    <Text fontSize="14px" color="white" noOfLines={1} whiteSpace="normal" wordBreak="break-word">
      {track.name}
    </Text>
  );

  const SongImage = (
    <Image
      boxSize={['75px', '90px']}
      objectFit="cover"
      src={track.image}
      draggable={false}
      cursor="pointer"
      onClick={() => onOpen(<FullscreenTrack track={drawerTrack} originUserId={userId} />)}
    />
  );

  const ArtistName = (
    <Stack direction="row">
      {track.explicit && <Image src={explicitImage} mr={-1} w="19px" />}
      <Text color="#BBB8B7" fontSize={['11px', '12px']} noOfLines={1}>
        {track.artist}
      </Text>
    </Stack>
  );

  const AlbumName = (
    <Text color="#BBB8B7" fontSize={['11px', '12px']} noOfLines={1}>
      {track.albumName}
    </Text>
  );

  return (
    <HStack>
      {SongImage}
      <Flex direction="column" justify="space-between" w="100%">
        <Flex direction="column">
          {SongTitle}
          <HStack spacing={1}>
            {ArtistName}
            <Box opacity={0.6}>•</Box>
            {AlbumName}
          </HStack>
        </Flex>
        <Flex justify="space-between">
          <SpotifyLogo icon />
          {action}
        </Flex>
      </Flex>
    </HStack>
  );
};

export default Card;
