import {
  Button,
  Flex,
  HStack,
  Image,
  Stack,
  Text,
  useColorModeValue,
  Link as LinkB,
  useMediaQuery,
} from '@chakra-ui/react';
import type { Profile } from '@prisma/client';
import { Link, useTransition } from '@remix-run/react';
import explicitImage from '~/assets/explicit-solid.svg';
import useTransitionElement from '~/hooks/useTransitionElement';
import type { Playback } from '~/services/spotify.server';
import PlayerBar from './PlayerBar';
import Tooltip from './Tooltip';

type PlayerProps = {
  user: Profile;
  playback?: Playback;
};

const MiniPlayer = ({ user, playback }: PlayerProps) => {
  const bg = useColorModeValue('music.50', 'music.900');
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
                {user.name.split(/[\s.]+/).slice(0, 1)}
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
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(playback.currently_playing?.item?.uri);
                    }}
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
                      <Image mr={1} src={explicitImage} w="16px" />
                    )}
                    <LinkB
                      as="span"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(
                          playback.currently_playing?.item?.type === 'track'
                            ? playback.currently_playing?.item.album?.artists[0].uri
                            : '',
                        );
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

                  <HStack>
                    {playback.queue &&
                      playback.queue
                        .slice(0, 5)
                        .reverse()
                        .map((track, idx) => (
                          <LinkB
                            as="span"
                            alignSelf="end"
                            key={idx}
                            href={track.uri}
                            target="_blank"
                          >
                            <Tooltip label={track.name} placement="top-start">
                              <Image
                                src={track.album.images[0].url}
                                borderRadius={5}
                                w={['60px', '75px']}
                                draggable={false}
                              />
                            </Tooltip>
                          </LinkB>
                        ))}
                  </HStack>

                  {/* {playback.currently_playing.context && playback.currently_playing.context.name && (
                    <Tooltip label={playback.currently_playing.context.name}>
                      <Image
                        src={playback.currently_playing.context.image}
                        borderRadius={5}
                        w={{ base: '50px', md: '65px' }}
                        draggable={false}
                      />
                    </Tooltip>
                  )} */}
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
                            w={['60px', '75px']}
                            draggable={false}
                          />
                        </Tooltip>
                      </LinkB>
                    ))}
                </HStack>
              )}

              {/* {isSmallScreen &&
                playback.currently_playing.context &&
                playback.currently_playing.context.name && (
                  <Tooltip label={playback.currently_playing.context.name}>
                    <Image
                      alignSelf="end"
                      src={playback.currently_playing.context.image}
                      borderRadius={5}
                      w={{ base: '50px', md: '65px' }}
                      draggable={false}
                    />
                  </Tooltip>
                )} */}
              <Tooltip label={playback.currently_playing.item?.name}>
                <LinkB
                  as="span"
                  href={
                    playback.currently_playing.item &&
                    playback.currently_playing.item.type === 'track'
                      ? playback.currently_playing?.item.album?.uri
                      : ''
                  }
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Image
                    src={image}
                    m={0}
                    boxSize={playback ? ['100px', '120px'] : '60px'}
                    borderRadius={2}
                  />
                </LinkB>
              </Tooltip>
            </HStack>
          )}
        </HStack>
      </Button>
      {playback && playback.currently_playing && (
        <PlayerBar playback={playback.currently_playing} />
      )}
    </Stack>
  );
};
export default MiniPlayer;
