import { Image, Stack, Text, Button } from '@chakra-ui/react';
import type { action } from '~/routes/$id/removeRecommend';
import explicitImage from '~/assets/explicit-solid.svg';
import type { ChakraProps } from '@chakra-ui/react';
import { useTypedFetcher } from 'remix-typedjson';
import { useClickDrag } from '~/hooks/useDrawer';
import type { Track } from '~/lib/types/types';
import { useParams } from '@remix-run/react';
import { forwardRef } from 'react';
// import type { Profile } from '@prisma/client';

type CardProps = {
  uri: string;
  trackId: string;
  image: string;
  albumUri: string | null;
  albumName: string | null;
  name: string;
  artist: string | null;
  artistUri: string | null;
  explicit: boolean;
  preview_url: string | null;
  link: string;

  // will show header (profile above Card) if createdAt is defined
  // createdBy?: Profile | null;
  // createdAt?: Date;
  // playlist?: Boolean;
  recommend?: boolean;
} & ChakraProps;

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({
    uri,
    trackId,
    image,
    albumUri,
    albumName,
    name,
    artist,
    artistUri,
    explicit,
    preview_url,
    link,
    recommend,
    // createdAt,
    // createdBy,
    // playlist,
  }) => {
    const { onMouseDown, onMouseMove, onClick } = useClickDrag();
    const track: Track = {
      uri: uri,
      trackId,
      image,
      albumUri,
      albumName,
      name,
      artist,
      artistUri,
      explicit,
      preview_url,
      link,
    };
    const fetcher = useTypedFetcher<typeof action>();
    const { id } = useParams();
    const removeFromRecommended = () => {
      const action = `/${id}/removeRecommend`;
      fetcher.submit({ trackId }, { replace: true, method: 'post', action });
    };
    const SongTitle = (
      <Text fontSize="16px" noOfLines={1} whiteSpace="normal" wordBreak="break-word">
        {name}
      </Text>
    );
    const SongImage = (
      <Image
        boxSize={['85px', '100px']}
        objectFit="cover"
        src={image}
        borderRadius={5}
        draggable={false}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onClick={() => onClick(track)}
      />
    );
    const ArtistName = (
      <Stack direction="row">
        {explicit && <Image src={explicitImage} mr={-1} w="19px" />}
        <Text fontSize="14px" opacity={0.8} noOfLines={1}>
          {artist}
        </Text>
      </Stack>
    );
    const AlbumName = (
      <Text fontSize="14px" opacity={0.8} w={['100%', '60%']} textAlign={['unset', 'center']}>
        {albumName}
      </Text>
    );
    const TitleArtistAlbumName = (
      <Stack>
        {SongTitle}
        <Stack direction={['column', 'row']} w={['auto', '600px']} justify="space-between">
          {ArtistName}
          {AlbumName}
        </Stack>
      </Stack>
    );

    return (
      <>
        <Stack
          flex="0 0 200px"
          cursor="pointer"
          direction="row"
          w={['100vw', '450px', '750px', '1100px']}
          py="5px"
          pl="5px"
        >
          <Stack direction="row">
            {SongImage}
            {TitleArtistAlbumName}
          </Stack>
          {recommend && <Button onClick={removeFromRecommended}>-</Button>}
        </Stack>
      </>
    );
  },
);

Card.displayName = 'Card';

export default Card;
