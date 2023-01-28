import { HStack, Image, Stack, Td, Text, Tr } from '@chakra-ui/react';
import explicitImage from '~/assets/explicit-solid.svg';
import { useClickDrag } from '~/hooks/useDrawer';
import useIsMobile from '~/hooks/useIsMobile';
import SpotifyLogo from './icons/SpotifyLogo';
// import type { Profile } from '@prisma/client';

const Track = (props: { track: SpotifyApi.TrackObjectFull; addedAt: string }) => {
  const { onMouseDown, onMouseMove, onClick } = useClickDrag();

  const isSmallScreen = useIsMobile();

  const track = {
    trackId: props.track.id,
    name: props.track.name,
    artist: props.track.artists[0].name,
    artistUri: props.track.artists[0].uri,
    albumName: props.track.album.name,
    albumUri: props.track.album.uri,
    image: props.track.album.images[0].url,
    explicit: props.track.explicit,
    uri: props.track.uri,
    duration: props.track.duration_ms,
    preview_url: props.track.preview_url,
    link: props.track.external_urls.spotify,
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
    />
  );
  const ArtistName = (
    <Stack direction="row" justify={['space-between', 'unset']}>
      <Stack>
        <HStack>
          {track.explicit && <Image src={explicitImage} mr={-1} w="19px" />}
          <Text fontSize="14px" opacity={0.8} noOfLines={1}>
            {track.artist}
          </Text>
        </HStack>
        <SpotifyLogo w="70px" h="21px" />
      </Stack>
      {isSmallScreen && <SpotifyLogo icon />}
    </Stack>
  );
  const AlbumName = (
    <Text fontSize="14px" opacity={0.8}>
      {track.albumName}
    </Text>
  );
  const AddedAt = (
    <Text fontSize="14px" opacity={0.8} w={['100%', '60%']} textAlign={['unset', 'center']}>
      {new Date(props.addedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })}
    </Text>
  );

  return (
    <Tr cursor="pointer" onClick={() => onClick(track)}>
      <>
        <Td>
          <HStack>
            {SongImage}
            <Stack w="100%">
              {SongTitle}
              {ArtistName}
            </Stack>
          </HStack>
        </Td>
        {!isSmallScreen ? (
          <>
            <Td>{AlbumName}</Td>
            <Td>{AddedAt}</Td>
          </>
        ) : null}
      </>

      {/* {recommend && <Button onClick={removeFromRecommended}>-</Button>} */}
    </Tr>
  );
};

export default Track;
