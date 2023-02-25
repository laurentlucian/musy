import { useParams } from '@remix-run/react';

import { Image, Stack, Text, Button } from '@chakra-ui/react';
import type { ChakraProps } from '@chakra-ui/react';

import { useTypedFetcher } from 'remix-typedjson';

import explicitImage from '~/assets/explicit-solid.svg';
import { useClickDrag } from '~/hooks/useDrawer';
import useIsMobile from '~/hooks/useIsMobile';
import type { Track } from '~/lib/types/types';
import type { action } from '~/routes/$id/removeRecommend';

import SpotifyLogo from '../icons/SpotifyLogo';

type CardProps = {
  layoutKey: string;
  recommend?: boolean;
  ref?: (node: HTMLDivElement | null) => void;
  track: Track;
  userId: string;
} & ChakraProps;

const Card = ({ layoutKey, recommend, track, userId }: CardProps) => {
  const isSmallScreen = useIsMobile();
  const { onClick, onMouseDown, onMouseMove } = useClickDrag();
  const drawerTrack = track;
  const fetcher = useTypedFetcher<typeof action>();
  const { id: profileId } = useParams();
  const id = track.id;
  const removeFromRecommended = () => {
    const action = `/${profileId}/removeRecommend`;
    fetcher.submit({ id }, { action, method: 'post', replace: true });
  };
  const SongTitle = (
    <Text fontSize="16px" noOfLines={1} whiteSpace="normal" wordBreak="break-word">
      {track.name}
    </Text>
  );
  const SongImage = (
    <Image
      boxSize={['85px', '100px']}
      objectFit="cover"
      src={track.image}
      draggable={false}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onClick={() => onClick(drawerTrack, userId, layoutKey)}
    />
  );
  const ArtistName = (
    <Stack direction="row">
      {track.explicit && <Image src={explicitImage} mr={-1} w="19px" />}
      <Text fontSize="14px" opacity={0.8} noOfLines={1}>
        {track.artist}
      </Text>
    </Stack>
  );
  const AlbumName = (
    <Text fontSize="14px" opacity={0.8} w={['100%', '60%']} textAlign={['unset', 'center']}>
      {track.albumName}
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
        justify="space-between"
      >
        <Stack direction="row">
          {SongImage}
          {TitleArtistAlbumName}
        </Stack>
        {recommend && <Button onClick={removeFromRecommended}>-</Button>}
        <SpotifyLogo icon={isSmallScreen} alignSelf={['end', 'unset']} />
      </Stack>
    </>
  );
};

export default Card;
