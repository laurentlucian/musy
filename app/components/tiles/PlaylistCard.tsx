import { forwardRef } from 'react';

import { Image, Stack, Text } from '@chakra-ui/react';
import type { ChakraProps } from '@chakra-ui/react';

import { usePlaylistDrawerActions } from '~/hooks/usePlaylistDrawer';

type PlaylistCardProps = { playlist: SpotifyApi.PlaylistObjectSimplified } & ChakraProps;

const PlaylistCard = forwardRef<HTMLDivElement, PlaylistCardProps>(
  ({ playlist, ...props }, ref) => {
    const { onOpen } = usePlaylistDrawerActions();
    const Title = (
      <Text fontSize="16px" noOfLines={1} whiteSpace="normal" wordBreak="break-word">
        {playlist.name}
      </Text>
    );
    const PlaylistImage = (
      <Image
        boxSize={['85px', '100px']}
        objectFit="cover"
        src={playlist.images[0]?.url} // 3 images available of different sizes this is the largest size
        draggable={false}
      />
    );
    const Description = (
      <Stack direction="row">
        <Text fontSize="14px" opacity={0.8} noOfLines={1}>
          {playlist.description}
        </Text>
      </Stack>
    );
    const TitleAndDescription = (
      <Stack justifyContent="center" px={[0, '50px']}>
        {Title}
        {Description}
      </Stack>
    );

    return (
      <>
        <Stack
          ref={ref}
          flex="0 0 200px"
          {...props}
          cursor="pointer"
          direction="row"
          w={['100vw', '450px', '750px', '1100px']}
          py="5px"
          pl="5px"
          onClick={() => onOpen(playlist)}
        >
          <Stack direction="row">
            {PlaylistImage}
            {TitleAndDescription}
          </Stack>
        </Stack>
      </>
    );
  },
);

PlaylistCard.displayName = 'PlaylistCard';

export default PlaylistCard;
