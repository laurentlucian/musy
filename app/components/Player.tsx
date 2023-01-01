import {
  Avatar,
  AvatarGroup,
  Flex,
  HStack,
  IconButton,
  Image,
  Link,
  Stack,
  Text,
  useColorModeValue,
  useInterval,
  Collapse,
  useDisclosure,
  Box,
} from '@chakra-ui/react';
import type { CurrentlyPlayingObjectCustom } from '~/services/spotify.server';
import Spotify_Logo_Black from '~/assets/Spotify_Logo_Black.png';
import Spotify_Logo_White from '~/assets/Spotify_Logo_White.png';
import { ArrowDown2, ArrowUp2, People } from 'iconsax-react';
import { useCallback, useEffect, useState } from 'react';
import explicitImage from '~/assets/explicit-solid.svg';
import PlayingFromTooltip from './PlayingFromTooltip';
import useSessionUser from '~/hooks/useSessionUser';
import type { Track } from '~/lib/types/types';
import PlayController from './PlayController';
import useIsMobile from '~/hooks/useIsMobile';
import { useFetcher } from '@remix-run/react';
import { useDataRefresh } from 'remix-utils';
import type { Party } from '@prisma/client';
import Tooltip from './Tooltip';
import PlayerBar from './PlayerBar';
import { useDrawerActions } from '~/hooks/useDrawer';

type PlayerProps = {
  id: string;
  party: Party[];
  playback: CurrentlyPlayingObjectCustom;
  item: SpotifyApi.TrackObjectFull;
};

const Player = ({ id, party, playback, item }: PlayerProps) => {
  const [playingFrom, setPlayingFrom] = useState(false);
  const [size, setSize] = useState('large');
  const [blur, setBlur] = useState(true);
  const { isOpen, onToggle } = useDisclosure();
  const { onOpen } = useDrawerActions();

  const bg = useColorModeValue('music.50', 'music.900');
  const currentUser = useSessionUser();
  const spotify_logo = useColorModeValue(Spotify_Logo_Black, Spotify_Logo_White);
  const isUserInParty = party.some((e) => e.userId === currentUser?.userId);
  const fetcher = useFetcher();
  const { refresh } = useDataRefresh();
  const busy = fetcher.submission?.formData.has('party') ?? false;

  const isSmallScreen = useIsMobile();

  const track: Track = {
    uri: item.uri,
    trackId: item.id,
    image: item.album?.images[0].url,
    albumUri: item.album.uri,
    albumName: item.album.name,
    name: item.name,
    artist: item.artists[0].name,
    artistUri: item.artists[0].uri,
    explicit: item.explicit,
  };

  useEffect(() => {
    const checkStick = () => {
      window.scrollY <= 100
        ? setSize('large')
        : window.scrollY <= 168
        ? setSize('medium')
        : setSize('small');
    };
    window.addEventListener('scroll', checkStick);

    return () => window.removeEventListener('scroll', checkStick);
  }, []);

  const active = playback.is_playing;
  useInterval(
    () => {
      refresh();
    },
    // -> checks if user started playing every minute
    active ? null : 60000,
    // -> refreshes every 30s regardless
    // 30000,
  );
  const interval = useCallback(
    () => setInterval(() => setPlayingFrom(!playingFrom), 6900),
    [playingFrom],
  );

  useEffect(() => {
    if (
      item.album.album_type === 'single' &&
      item.album.total_tracks === 1 &&
      playback?.context?.type !== 'artist' &&
      playback?.context?.type !== 'playlist'
    ) {
      clearInterval(interval());
      setPlayingFrom(false);
    } else {
      interval();
    }
  }, [playback.context, interval, item.album.album_type, item.album.type, item.album.total_tracks]);

  if (!item) return null;

  const isOwnProfile = currentUser?.userId === id;

  return (
    <>
      <Stack pos="sticky" top={0} zIndex={1} spacing={-1} overflow="visible">
        <Stack backdropFilter="blur(27px)" borderRadius={size === 'small' ? 0 : 5}>
          <Collapse in={!isOpen} animateOpacity>
            <Stack
              spacing={0}
              bg={bg}
              borderRadius={size === 'small' ? 0 : 5}
              backdropFilter={blur && isSmallScreen ? 'blur(27px)' : 'none'}
            >
              <Flex h="135px" px="2px" py="2px" justify="space-between">
                <Stack pl="7px" spacing={1} flexGrow={1}>
                  <Stack direction="column" spacing={0.5}>
                    <Text
                      noOfLines={1}
                      onClick={() => onOpen(track)}
                      cursor="pointer"
                      w={['200px', '68%']}
                      overflow="hidden"
                      whiteSpace="nowrap"
                    >
                      {item.name}
                    </Text>
                    <Flex onClick={() => onOpen(track)} cursor="pointer" w={['200px', '68%']}>
                      {item.explicit && <Image mr={1} src={explicitImage} w="19px" />}
                      <Text opacity={0.8} fontSize="13px" noOfLines={1}>
                        {item.album?.artists[0].name}
                      </Text>
                    </Flex>
                    {playback.context && (
                      <>
                        <Text
                          fontSize="13px"
                          transition="opacity 1.69s ease-in-out"
                          opacity={playingFrom ? 1 : 0}
                          w={['200px', '68%']}
                          noOfLines={1}
                        >
                          Playing From{' '}
                          {item.album.album_type === 'single' &&
                          playback.context.type === 'album' &&
                          item.album.total_tracks !== 1
                            ? 'EP'
                            : playback.context.type.charAt(0).toUpperCase() +
                              playback.context.type.slice(1)}
                        </Text>
                        <Tooltip
                          label={
                            <PlayingFromTooltip // tooltip does not show properly when playing from artist
                              name={playback.context.name}
                              description={playback.context.description}
                              image={playback.context.image}
                            />
                          }
                          placement="bottom-start"
                        >
                          <Link
                            href={playback.context.uri}
                            fontSize="15px"
                            fontWeight="bold"
                            transition="opacity 1.69s ease-in-out"
                            opacity={playingFrom ? 1 : 0}
                            overflow="scroll"
                            whiteSpace="normal"
                            wordBreak="break-word"
                            noOfLines={1}
                            w={['200px', '68%']}
                          >
                            {playback.context.name
                              ? playback.context.name
                              : playback.context.type === 'artist'
                              ? item.artists[0].name
                              : item.album.name}
                          </Link>
                        </Tooltip>
                      </>
                    )}
                    <Stack spacing={1} pos="absolute" pt="48px" lineHeight="shorter" w="100%">
                      <Text
                        fontSize="13px"
                        fontWeight="normal"
                        transition="opacity 1.69s ease-in-out"
                        opacity={playingFrom ? 0 : 1}
                        noOfLines={1}
                        w={['200px', '68%']}
                      >
                        Listening on
                      </Text>
                      <Text
                        fontSize="15px"
                        fontWeight="bold"
                        transition="opacity 1.69s ease-in-out"
                        opacity={playingFrom ? 0 : 1}
                        noOfLines={1}
                        w={['200px', '68%']}
                      >
                        {playback.device.name.split(' ').slice(0, 2).join(' ')}
                      </Text>
                    </Stack>
                  </Stack>
                  <HStack h="100%">
                    {active ? (
                      <HStack mt="auto !important" mb="5px !important">
                        <Link href="https://open.spotify.com" target="_blank" rel="external">
                          <Image height="30px" minW="98px" src={spotify_logo} />
                        </Link>
                        {party.length && (
                          <AvatarGroup size="xs" spacing={-2} max={5}>
                            {party.map((u) => {
                              return <Avatar key={u.userId} name={u.userName} src={u.userImage} />;
                            })}
                          </AvatarGroup>
                        )}
                        {!isOwnProfile && (
                          <>
                            <Tooltip label={isUserInParty ? 'Leave session' : 'Join session'}>
                              <fetcher.Form
                                action={isUserInParty ? `/${id}/leave` : `/${id}/join`}
                                method="post"
                                replace
                              >
                                <IconButton
                                  aria-label={isUserInParty ? 'Leave' : 'Join'}
                                  name="party"
                                  icon={<People size="24px" />}
                                  color={isUserInParty ? 'spotify.green' : undefined}
                                  _hover={{ color: isUserInParty ? 'red.600' : 'spotify.green' }}
                                  variant="ghost"
                                  type="submit"
                                  cursor="pointer"
                                  isLoading={busy}
                                />
                              </fetcher.Form>
                            </Tooltip>
                          </>
                        )}
                      </HStack>
                    ) : (
                      <Link href="https://open.spotify.com">
                        <Image height="30px" width="98px" src={spotify_logo} />
                      </Link>
                    )}
                    {isOwnProfile && !isSmallScreen && (
                      <HStack p={1} h="100%" align="end">
                        <PlayController fetcher={fetcher} playback={playback} id={id} />
                      </HStack>
                    )}
                  </HStack>
                </Stack>
                <HStack spacing={1} align="end">
                  {/* {playback.context &&
                            playback.context.name &&
                            !isSmallScreen &&
                            (playback.context.type === 'collection' ? (
                              <Tooltip label={playback.context.name} placement="bottom-end">
                                <Image
                                  src={playback.context.image}
                                  boxSize={{ base: '65px', sm: '75px', lg: '108px' }}
                                  borderRadius={2}
                                  transition="width 0.25s, height 0.25s"
                                />
                              </Tooltip>
                            ) : (
                              <Link href={playback.context?.uri} target="_blank">
                                <Tooltip label={playback.context.name} placement="bottom-end">
                                  <Image
                                    src={playback.context.image}
                                    boxSize={{ base: '45px', sm: '75px', lg: '108px' }}
                                    borderRadius={2}
                                    transition="width 0.25s, height 0.25s"
                                  />
                                </Tooltip>
                              </Link>
                            ))} */}
                  {/* <Link href={albumLink ?? ''} target="_blank"> */}
                  <Tooltip label={item.album.name} placement="bottom-end">
                    <Image
                      src={item.album?.images[0].url}
                      mt={
                        size === 'large'
                          ? [0, -47, -47, -47, -200]
                          : size === 'medium'
                          ? [0, -47, -47, -47, '-86px']
                          : 0
                      }
                      boxSize={
                        size === 'large'
                          ? [135, 160, 160, 200, 334]
                          : size === 'medium'
                          ? [135, 160, 160, 200, 221]
                          : 135
                      }
                      minW={
                        size === 'large'
                          ? [135, 160, 160, 200, 334]
                          : size === 'medium'
                          ? [135, 160, 160, 200, 221]
                          : 135
                      }
                      borderRadius={size === 'small' ? 0 : 2}
                      transition="width 0.25s, height 0.25s, margin-top 0.25s, min-width 0.25s"
                      pos="absolute"
                      right={0}
                      top={0}
                      onClick={() => onOpen(track)}
                      cursor="pointer"
                    />
                  </Tooltip>
                  {/* </Link> */}
                </HStack>
              </Flex>
              {currentUser?.userId === id && isSmallScreen && (
                <HStack pl={2}>
                  <PlayController fetcher={fetcher} playback={playback} id={id} />
                </HStack>
              )}
              <PlayerBar playback={playback} />
            </Stack>
          </Collapse>
        </Stack>
        <Box
          w="-webkit-fit-content"
          bg={bg}
          borderRadius="0px 0px 3px 3px"
          zIndex={-1}
          backdropFilter={!isSmallScreen ? 'blur(27px)' : 'none'}
        >
          <IconButton
            icon={isOpen ? <ArrowDown2 /> : <ArrowUp2 />}
            variant="ghost"
            onClick={() => {
              onToggle();
              setBlur(true);
            }}
            aria-label={isOpen ? 'open player' : 'close player'}
            _hover={{ opacity: 1, color: 'spotify.green' }}
            opacity={isSmallScreen ? 1 : 0.5}
            _active={{ boxShadow: 'none' }}
            boxShadow="none"
          />
        </Box>
      </Stack>
    </>
  );
};
export default Player;
