import { Link, useTransition } from '@remix-run/react';

import {
  Button,
  Flex,
  HStack,
  Image,
  Stack,
  Text,
  useColorModeValue,
  Link as LinkB,
} from '@chakra-ui/react';

import type { Profile } from '@prisma/client';

import explicitImage from '~/assets/explicit-solid.svg';
import { useDrawerActions } from '~/hooks/useDrawer';
import useIsMobile from '~/hooks/useIsMobile';
import type { Playback } from '~/services/spotify.server';

import Waver from '../../icons/Waver';
import Tooltip from '../../Tooltip';
import PlayerBar from '../PlayerBar';

type PlayerProps = {
  playback?: Playback;
  user: Profile;
};

const MiniPlayer = ({ playback, user }: PlayerProps) => {
  const bg = useColorModeValue('music.200', 'music.900');
  const transition = useTransition();
  const isSmallScreen = useIsMobile();
  const { onOpen } = useDrawerActions();

  const [first, second = ''] = user.name.split(/[\s.]+/);
  const name = second.length > 4 || first.length >= 6 ? first : [first, second].join(' ');

  const track =
    playback?.currently_playing?.item?.type === 'track' ? playback?.currently_playing?.item : null;
  const artist = track?.album.artists[0].name;
  const image = track?.album.images[0].url;

  const formattedTrack = track
    ? {
        albumName: track.album.name,
        albumUri: track.album.uri,
        artist: track.album.artists[0].name,
        artistUri: track.album.artists[0].uri,
        explicit: track.explicit,
        image: track.album?.images[0].url,
        link: track.external_urls.spotify,
        name: track.name,
        preview_url: track.preview_url,
        trackId: track.id,
        uri: track.uri,
        userId: user.userId,
      }
    : null;

  return (
    <Stack
      minW={['370px', '100%']}
      maxW={['370px', '100%']}
      bg={bg}
      spacing={0}
      borderRadius={5}
      ml="-4px"
    >
      <Button
        as={Link}
        to={`/${user.userId}`}
        variant="ghost"
        h={playback ? ['100px', '120px'] : '65px'}
        minW={['370px', '100%']}
        maxW={['370px', '100%']}
        pr={0}
      >
        <HStack spacing={3} w="100%">
          <Image boxSize="50px" borderRadius="100%" minH="50px" minW="50px" src={user.image} />
          <Stack>
            <HStack>
              <Text fontWeight="bold" fontSize={['15px', '20px']}>
                {name}
              </Text>
              {!isSmallScreen && transition.location?.pathname.includes(user.userId) && <Waver />}
            </HStack>
            <Stack maxW={['40px', '100%']}>
              <Text opacity={0.8} fontSize={{ base: 'smaller', md: 'xs' }}>
                {user.bio?.slice(0, 15)}
              </Text>
            </Stack>
            <Text opacity={0}>hiiii</Text>
          </Stack>

          {track ? (
            <HStack w="100%" spacing={2} justify="end">
              <Stack spacing={1} h="100%" align="end">
                {!isSmallScreen && (
                  <>
                    <LinkB
                      as="span"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(track.uri);
                      }}
                    >
                      <Text
                        noOfLines={[1]}
                        maxW={{ base: '110px', md: '300px', xl: 'unset' }}
                        fontSize={{ base: 'smaller', md: 'sm' }}
                      >
                        {track.name}
                      </Text>
                    </LinkB>
                    <Flex>
                      {track.explicit && <Image mr={1} src={explicitImage} w="16px" />}
                      <LinkB
                        as="span"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(track.album.artists[0].uri);
                        }}
                      >
                        <Text
                          opacity={0.8}
                          noOfLines={[1]}
                          maxW={{ base: '110px', md: '300px', xl: 'unset' }}
                          fontSize={{ base: 'smaller', md: 'xs' }}
                        >
                          {artist}
                        </Text>
                      </LinkB>
                    </Flex>
                  </>
                )}
                <HStack>
                  {playback &&
                    playback.queue
                      ?.slice(0, isSmallScreen ? 1 : 2)
                      .reverse()
                      .map((track, idx) => (
                        <LinkB
                          as="span"
                          alignSelf="end"
                          key={idx}
                          href={track.uri}
                          target="_blank"
                          onClick={(e) => {
                            e.preventDefault();
                            onOpen({
                              albumName: track.album.name,
                              albumUri: track.album.uri,
                              artist: track.album.artists[0].name,
                              artistUri: track.album.artists[0].uri,
                              explicit: track.explicit,
                              image: track.album.images[0].url,
                              link: track.external_urls.spotify,
                              name: track.name,
                              preview_url: track.preview_url,
                              trackId: track.id,
                              uri: track.uri,
                            });
                          }}
                        >
                          <Tooltip label={<Text>{track.name}</Text>}>
                            <Image
                              src={track.album.images[0].url}
                              w={['60px', '75px']}
                              draggable={false}
                            />
                          </Tooltip>
                        </LinkB>
                      ))}
                </HStack>
              </Stack>

              <Tooltip label={<Text>{track.name}</Text>}>
                <LinkB
                  as="span"
                  onClick={(e) => {
                    e.preventDefault();
                    formattedTrack && onOpen(formattedTrack);
                  }}
                >
                  <Image src={image} m={0} boxSize={playback ? ['100px', '120px'] : '60px'} />
                </LinkB>
              </Tooltip>
            </HStack>
          ) : null}
        </HStack>
      </Button>
      {playback && playback.currently_playing && (
        <PlayerBar playback={playback.currently_playing} />
      )}
    </Stack>
  );
};
export default MiniPlayer;
