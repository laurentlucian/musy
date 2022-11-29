import {
  Button,
  Flex,
  HStack,
  Image,
  Progress,
  Stack,
  Text,
  useColorModeValue,
  useInterval,
  Link as LinkB,
  useMediaQuery,
  Tooltip,
} from '@chakra-ui/react';
import type { Profile } from '@prisma/client';
import { Link, useNavigate, useTransition } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import explicitImage from '~/assets/explicit-solid.svg';
import useTransitionElement from '~/hooks/useTransitionElement';
import type { Playback } from '~/services/spotify.server';

type PlayerProps = {
  user: Profile;
  playback?: Playback;
};

const MiniPlayer = ({ user, playback }: PlayerProps) => {
  const bg = useColorModeValue('music.50', 'music.900');
  const color = useColorModeValue('music.900', 'music.50');
  const duration = playback?.currently_playing?.item?.duration_ms ?? 0;
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const refreshed = useRef(false);
  const percentage = duration ? (current / duration) * 100 : 0;
  const transition = useTransition();
  const loaderElement = useTransitionElement(transition.location?.pathname.includes(user.userId));
  const [isSmallScreen] = useMediaQuery('(max-width: 600px)');

  const artist =
    playback?.currently_playing?.item?.type === 'track'
      ? playback?.currently_playing?.item?.album?.artists[0].name
      : playback?.currently_playing?.item?.show.name;

  const image =
    playback?.currently_playing?.item?.type === 'track'
      ? playback?.currently_playing?.item?.album?.images[0].url
      : playback?.currently_playing?.item?.images[0].url;

  const handleLink = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.stopPropagation();
  };

  // reset seek bar on new song/props
  useEffect(() => {
    if (playback) {
      const progress = playback?.currently_playing?.progress_ms ?? 0;
      setCurrent(progress);
      refreshed.current = false;
    }
  }, [playback]);

  // simulating a seek bar tick
  useInterval(
    () => {
      if (!duration) return null;
      // ref prevents from refreshing again before new data has hydrated; will loop otherwise
      if (current > duration && !refreshed.current) {
        navigate('.', { replace: true });
        refreshed.current = true;
      }
      setCurrent((prev) => prev + 1000);
    },
    playback ? 1000 : null,
  );

  return (
    <Stack w={[363, '100%']} bg={bg} spacing={0} borderRadius={5}>
      <Button
        as={Link}
        display="flex"
        flexDirection="column"
        to={`/${user.userId}`}
        variant="ghost"
        h={playback ? ['100px', '120px'] : '65px'}
        w={[363, '100%']}
        pr={0}
      >
        <HStack spacing={3} w="100%">
          <Image boxSize="50px" borderRadius="100%" src={user.image} />
          <Stack>
            <HStack>
              <Text fontWeight="bold" fontSize={['15px', '20px']}>
                {user.name.split(' ').slice(0, 1)}
              </Text>
              {!isSmallScreen && loaderElement}
            </HStack>
            <Text opacity={0.8} fontSize={{ base: 'smaller', md: 'xs' }}>
              {user.bio}
            </Text>
          </Stack>

          {playback && playback.currently_playing && (
            <HStack w="100%" spacing={2} justify="end">
              {!isSmallScreen && (
                <Stack spacing={1} h="100%" align="end">
                  <LinkB
                    as="span"
                    href={playback.currently_playing.item?.uri}
                    target="_blank"
                    onClick={handleLink}
                  >
                    <Text
                      noOfLines={[1]}
                      maxW={{ base: '110px', md: '300px', xl: 'unset' }}
                      fontSize={{ base: 'smaller', md: 'sm' }}
                    >
                      {playback.currently_playing?.item?.name}
                    </Text>
                  </LinkB>
                  <Flex>
                    {playback?.currently_playing.item?.explicit && (
                      <Image mr={1} src={explicitImage} w="19px" />
                    )}
                    <LinkB
                      as="span"
                      href={
                        playback.currently_playing.item?.type === 'track'
                          ? playback.currently_playing.item.album?.artists[0].uri
                          : ''
                      }
                      target="_blank"
                      onClick={handleLink}
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

                  <HStack>
                    {playback.queue &&
                      playback.queue.slice(0, 4).map((track, idx) => (
                        <LinkB
                          as="span"
                          alignSelf="end"
                          key={idx}
                          href={track.album.uri}
                          target="_blank"
                        >
                          <Tooltip label={track.album.name} placement="top-start">
                            <Image
                              src={track.album.images[0].url}
                              borderRadius={5}
                              w="50px"
                              draggable={false}
                            />
                          </Tooltip>
                        </LinkB>
                      ))}
                  </HStack>
                </Stack>
              )}

              {isSmallScreen && (
                <HStack>
                  {playback.queue &&
                    playback.queue.slice(0, 1).map((track, idx) => (
                      <LinkB as="span" alignSelf="end" key={idx} href={track.uri} target="_blank">
                        <Tooltip label={track.name} placement="top-start">
                          <Image
                            src={track.album.images[0].url}
                            borderRadius={5}
                            w="75px"
                            draggable={false}
                          />
                        </Tooltip>
                      </LinkB>
                    ))}
                </HStack>
              )}
              <LinkB
                as="span"
                href={
                  playback.currently_playing.item &&
                  playback.currently_playing.item.type === 'track'
                    ? playback.currently_playing?.item.album?.uri
                    : ''
                }
                target="_blank"
                onClick={handleLink}
              >
                <Image
                  src={image}
                  m={0}
                  boxSize={playback ? ['100px', '120px'] : '60px'}
                  borderRadius={2}
                />
              </LinkB>
            </HStack>
          )}
        </HStack>
      </Button>
      {playback && (
        <Progress
          sx={{
            backgroundColor: bg,
            '> div': {
              backgroundColor: color,
            },
          }}
          borderBottomLeftRadius="10px"
          borderBottomRightRadius="10px"
          h="2px"
          value={percentage}
        />
      )}
    </Stack>
  );
};
export default MiniPlayer;
