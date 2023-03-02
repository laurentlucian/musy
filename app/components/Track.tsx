import { HStack, Image, Stack, Td, Text, Tr } from '@chakra-ui/react';

import { motion } from 'framer-motion';

import explicitImage from '~/assets/explicit-solid.svg';
import musyIcon from '~/assets/musySquareIcon.png';
import { useClickDrag } from '~/hooks/useDrawer';
import useIsMobile from '~/hooks/useIsMobile';
import type { Track as Tracks } from '~/lib/types/types';

import SpotifyLogo from './icons/SpotifyLogo';
// import type { Profile } from '@prisma/client';

const Track = (props: {
  addedAt: string;
  index: number;
  track: SpotifyApi.TrackObjectFull;
  tracks: Tracks[];
  userId: string;
}) => {
  const { onClick, onMouseDown, onMouseMove } = useClickDrag();
  const isSmallScreen = useIsMobile();
  const layoutkey = props.addedAt.toString();

  const track = {
    albumName: props.track.album.name,
    albumUri: props.track.album.uri,
    artist: props.track.artists[0].name,
    artistUri: props.track.artists[0].uri,
    duration: props.track.duration_ms,
    explicit: props.track.explicit,
    id: props.track.id,
    image: props.track.album.images[0]?.url ?? musyIcon, // @todo: add default image if one does not exist
    link: props.track.external_urls.spotify,
    name: props.track.name,
    preview_url: props.track.preview_url,
    uri: props.track.uri,
  };

  const convert = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ':' + (Number(seconds) < 10 ? '0' : '') + seconds;
  };

  const SongTitle = (
    <Text fontSize="16px" noOfLines={1} whiteSpace="normal" wordBreak="break-word">
      {track.name}
    </Text>
  );
  const SongImage = (
    <Image
      as={motion.img}
      layoutId={track.id + layoutkey}
      boxSize={['85px', '100px']}
      objectFit="cover"
      src={track.image}
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
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}
    </Text>
  );

  const SongLength = (
    <Text fontSize="14px" opacity={0.8} w={['100%', '60%']} textAlign={['unset', 'center']}>
      {convert(track.duration)}
    </Text>
  );

  return (
    <Tr
      cursor="pointer"
      onClick={() => onClick(track, props.userId, layoutkey, props.tracks, props.index)}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      zIndex={10}
    >
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
          <Td>{SongLength}</Td>
        </>
      ) : null}
    </Tr>
  );
};

export default Track;
