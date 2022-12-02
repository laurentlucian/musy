import { HStack, Image, Stack, Text } from '@chakra-ui/react';
import type { CurrentlyPlayingObjectCustom } from '~/services/spotify.server';

type PlayingFromType = {
  playback: CurrentlyPlayingObjectCustom;
  item: SpotifyApi.TrackObjectFull;
};

const PlayingFrom = ({ playback, item }: PlayingFromType) => {
  if (
    !playback.context ||
    (item.album.album_type === 'single' && playback.context.type === 'album')
  )
    return null;

  return (
    <HStack>
      <Image src={playback.context.image} boxSize="55px" borderRadius={2} />
      <Stack py={2}>
        <Text fontWeight="bold" fontSize="12px">
          {playback.context.name}
        </Text>
        <Text fontStyle="italic" fontSize="10px">
          {playback.context.description}
        </Text>
      </Stack>
    </HStack>
  );
};

export default PlayingFrom;
