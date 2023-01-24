import { Heading, Image, Link, Stack, Text } from '@chakra-ui/react';
import useIsMobile from '~/hooks/useIsMobile';
import type { CurrentlyPlayingObjectCustom } from '~/services/spotify.server';
import Tooltip from './Tooltip';
type PlayingFromType = {
  playback: CurrentlyPlayingObjectCustom;
  item: SpotifyApi.TrackObjectFull;
};
const PlayingFrom = ({ playback, item }: PlayingFromType) => {
  const isSmallScreen = useIsMobile();
  if (
    !playback.context ||
    (item.album.album_type === 'single' && playback.context.type === 'album')
  )
    return null;
  const type = playback.context.type?.charAt(0).toUpperCase() + playback.context.type?.slice(1);
  return (
    <Stack w="max-content">
      <Heading fontSize={['xs', 'sm']}>Playing From {type}</Heading>
      {playback.context &&
        !isSmallScreen &&
        (playback.context.name && playback.context.type === 'collection' ? (
          <>
            <Tooltip label={playback.context.name + ' ' + type} placement="top-start">
              <Image
                src={playback.context.image}
                boxSize={{ base: '65px', sm: '75px', lg: '300px' }}
              />
              <Text fontSize="13px" noOfLines={3} whiteSpace="normal" wordBreak="break-word">
                {playback.context.name}
              </Text>
            </Tooltip>
          </>
        ) : playback.context.type === 'album' ? (
          <>
            <Link href={playback.context?.uri} target="_blank">
              <Tooltip label={item.album.name + ' ' + type} placement="top-start">
                <Image
                  src={item.album.images[0].url}
                  boxSize={{ base: '45px', sm: '75px', lg: '300px' }}
                />
              </Tooltip>
            </Link>
            <Link href={playback.context?.uri} target="_blank">
              <Tooltip label={item.album.name} placement="top-start">
                <Text fontSize="13px" noOfLines={3} whiteSpace="normal" wordBreak="break-word">
                  {item.album.name}
                </Text>
              </Tooltip>
            </Link>
          </>
        ) : (
          <>
            <Link href={playback.context?.uri} target="_blank">
              <Tooltip label={playback.context.name + ' ' + type} placement="top-start">
                <Image
                  src={playback.context.image}
                  boxSize={{ base: '45px', sm: '75px', lg: '300px' }}
                />
              </Tooltip>
            </Link>
            <Link href={playback.context?.uri} target="_blank">
              <Tooltip label={playback.context.name} placement="top-start">
                <Text fontSize="13px" noOfLines={3} whiteSpace="normal" wordBreak="break-word">
                  {playback.context.name}
                </Text>
              </Tooltip>
            </Link>
          </>
        ))}
    </Stack>
  );
};
export default PlayingFrom;
