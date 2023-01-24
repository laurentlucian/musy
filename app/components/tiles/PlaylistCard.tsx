import { Image, Stack, Text } from '@chakra-ui/react';
import type { ChakraProps } from '@chakra-ui/react';
import { forwardRef } from 'react';

type PlaylistCardProps = {
  uri: string;
  image: string;
  playlistUri: string | null;
  name: string;
  description: string | null;

  // will show header (profile above PlaylistCard) if createdAt is defined
  // createdBy?: Profile | null;
  // createdAt?: Date;
} & ChakraProps;

const PlaylistCard = forwardRef<HTMLDivElement, PlaylistCardProps>(
  ({ uri, image, playlistUri, name, description, ...props }, ref) => {
    // const { onOpen } = useDrawerActions();
    // const track: Track = {
    //   uri: uri,
    //   trackId,
    //   image,
    //   albumUri,
    //   albumName,
    //   name,
    //   artist,
    //   artistUri,
    //   explicit,
    // };
    const PlaylistTitle = (
      <Text fontSize="16px" noOfLines={1} whiteSpace="normal" wordBreak="break-word">
        {name}
      </Text>
    );
    const PlaylistImage = (
      <Image
        boxSize={['85px', '100px']}
        objectFit="cover"
        src={image}
        draggable={false}
        // onClick={() => onOpen(track)}
      />
    );
    const Description = (
      <Stack direction="row">
        <Text fontSize="14px" opacity={0.8} noOfLines={1}>
          {description}
        </Text>
      </Stack>
    );
    const TitleAndDescription = (
      <Stack justifyContent="center" px={[0, '50px']}>
        {PlaylistTitle}
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
