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
import { ArrowDown2, ArrowUp2, PauseCircle, People, PlayCircle } from 'iconsax-react';
import type { CurrentlyPlayingObjectCustom } from '~/services/spotify.server';
import { useDrawerActions, useDrawerIsPlaying } from '~/hooks/useDrawer';
import { useCallback, useEffect, useRef, useState } from 'react';
import Spotify_Logo_Black from '~/assets/Spotify_Logo_Black.png';
import Spotify_Logo_White from '~/assets/Spotify_Logo_White.png';
import { useFetcher, useRevalidator } from '@remix-run/react';
import PlayingFromTooltip from './../PlayingFromTooltip';
import explicitImage from '~/assets/explicit-solid.svg';
import useSessionUser from '~/hooks/useSessionUser';
import type { Track } from '~/lib/types/types';
import PlayController from './PlayController';
import useIsMobile from '~/hooks/useIsMobile';
import type { Party } from '@prisma/client';
import PlayerBar from './PlayerBar';
import Tooltip from './../Tooltip';

type PlayerProps = {
  id: string;
  party: Party[];
  playback: CurrentlyPlayingObjectCustom;
  item: SpotifyApi.TrackObjectFull;
};

const Player = ({ id, party, playback, item }: PlayerProps) => {
  const currentUser = useSessionUser();
  const isOwnProfile = currentUser?.userId === id;
  const preview =
    currentUser !== null && currentUser.settings?.allowPreview === true && !isOwnProfile;
  const [playingFrom, setPlayingFrom] = useState(false);
  const [hasPreview, setHasPreview] = useState<boolean>();
  const [playing, setPlaying] = useState(preview);
  const [size, setSize] = useState('large');
  const [blur, setBlur] = useState(true);

  const { isOpen, onToggle } = useDisclosure();
  const { onOpen } = useDrawerActions();
  const isPlaying = useDrawerIsPlaying();

  const bg = useColorModeValue('music.900', 'music.50');

  const spotify_logo = useColorModeValue(Spotify_Logo_White, Spotify_Logo_Black);
  const isUserInParty = party.some((e) => e.userId === currentUser?.userId);
  const fetcher = useFetcher();
  const { revalidate } = useRevalidator();
  const busy = fetcher.submission?.formData.has('party') ?? false;
  const isSmallScreen = useIsMobile();

  const audioRef = useRef<HTMLAudioElement>(null);

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
    preview_url: item.preview_url,
    link: item.external_urls.spotify,
  };

  const onClick = () => {
    if (audioRef.current && !playing) {
      audioRef.current.play();
      setPlaying(true);
    } else {
      audioRef.current?.pause();
      setPlaying(false);
    }
  };
  const icon = playing ? <PauseCircle /> : <PlayCircle />;

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else if (playing) {
      audioRef.current?.play();
      setPlaying(true);
    }
  }, [isPlaying, playing]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.05;
      setHasPreview(true);
      audioRef.current.addEventListener('ended', () => setPlaying(false));
      return () => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        audioRef?.current?.removeEventListener('ended', () => setPlaying(false));
      };
    } else {
      setPlaying(false);
      setHasPreview(false);
    }
  }, [audioRef]);

  useEffect(() => {
    if (audioRef.current?.paused && playing) {
      audioRef.current.play();
    }
  }, [playing]);

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
      revalidate();
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
                      <HStack mb="5px !important">
                        <Link href="https://open.spotify.com" target="_blank" rel="external">
                          <Image
                            mt="40px"
                            height="30px"
                            minW="98px"
                            maxW="98px"
                            src={spotify_logo}
                          />
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
                            <Tooltip
                              label={hasPreview ? '' : 'song has no preview'}
                              openDelay={hasPreview ? 200 : 0}
                              // closeOnClick <- does not work because the icon changes >:( so annoying!!!!
                            >
                              <IconButton
                                onClick={onClick}
                                icon={icon}
                                variant="ghost"
                                aria-label={playing ? 'pause' : 'play'}
                                _hover={{ color: 'spotify.green' }}
                                _active={{ boxShadow: 'none' }}
                              />
                            </Tooltip>
                          </>
                        )}
                      </HStack>
                    ) : (
                      <Link href="https://open.spotify.com">
                        <Image mt="40px" height="30px" maxW="98px" minW="98px" src={spotify_logo} />
                      </Link>
                    )}
                    {isOwnProfile && !isSmallScreen && (
                      <PlayController fetcher={fetcher} playback={playback} id={id} />
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
        {item.preview_url && <audio autoPlay={preview} ref={audioRef} src={item.preview_url} />}
      </Stack>
    </>
  );
};
export default Player;
