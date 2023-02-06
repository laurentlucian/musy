import { useFetcher, useRevalidator } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';

import {
  Box,
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
} from '@chakra-ui/react';

import type { Party, Playback, Track } from '@prisma/client';
import { ArrowDown2, ArrowUp2, PauseCircle, People, PlayCircle } from 'iconsax-react';

import explicitImage from '~/assets/explicit-solid.svg';
import { useClickDrag, useDrawerIsPlaying } from '~/hooks/useDrawer';
import useIsMobile from '~/hooks/useIsMobile';
import useSessionUser from '~/hooks/useSessionUser';
import type { Track as DrawerTrack } from '~/lib/types/types';
import type { CurrentlyPlayingObjectCustom } from '~/services/spotify.server';

import AudioVisualizer from '../icons/AudioVisualizer';
import SpotifyLogo from '../icons/SpotifyLogo';
import Tooltip from '../Tooltip';
import PlayController from './PlayController';
import PlayerBar from './PlayerBar';
import PlayingFromTooltip from './PlayingFromTooltip';

type PlayerProps = {
  id: string;
  party: Party[];
  playback: Playback & {
    track: Track;
  };
};

const PlayerPrisma = ({ id, party, playback }: PlayerProps) => {
  const currentUser = useSessionUser();
  const isOwnProfile = currentUser?.userId === id;
  const preview =
    currentUser !== null && currentUser.settings?.allowPreview === true && !isOwnProfile;
  // const [playingFrom, setPlayingFrom] = useState(false);
  const [hasPreview, setHasPreview] = useState<boolean>();
  const [playing, setPlaying] = useState(preview);
  const [showPause, setShowPause] = useState(true);
  const [hovering, setHovering] = useState<boolean>();
  const [size, setSize] = useState('large');
  const [blur, setBlur] = useState(true);

  const { isOpen, onToggle } = useDisclosure();
  const { onClick, onMouseDown, onMouseMove } = useClickDrag();
  const isPlaying = useDrawerIsPlaying();

  const bg = useColorModeValue('music.50', '#10101066');
  const color = useColorModeValue('#10101066', 'music.50');
  const color1 = useColorModeValue('music.800', 'music.200');

  const isUserInParty = party.some((e) => e.userId === currentUser?.userId);
  const fetcher = useFetcher();
  const { revalidate } = useRevalidator();
  const busy = fetcher.submission?.formData.has('party') ?? false;
  const isSmallScreen = useIsMobile();

  const audioRef = useRef<HTMLAudioElement>(null);

  const drawerTrack: DrawerTrack = {
    albumName: playback.track.albumName,
    albumUri: playback.track.albumUri,
    artist: playback.track.artist,
    artistUri: playback.track.artistUri,
    explicit: playback.track.explicit,
    image: playback.track.image,
    link: playback.track.link,
    name: playback.track.name,
    preview_url: playback.track.preview_url,
    trackId: playback.trackId,
    uri: playback.track.uri,
  };

  const handleMusicControls = () => {
    if (audioRef.current && !playing) {
      void audioRef.current.play();
      setPlaying(true);
      setShowPause(false);
    } else {
      audioRef.current?.pause();
      setPlaying(false);
    }
  };
  const icon =
    playing && !showPause ? (
      <AudioVisualizer />
    ) : playing && showPause && hovering ? (
      <PauseCircle />
    ) : playing ? (
      <AudioVisualizer />
    ) : (
      <PlayCircle />
    );

  const handleMouseLeavePreviewButton = () => {
    setShowPause(true);
    setHovering(false);
  };
  const handleMouseEnterPreviewButton = () => {
    setHovering(true);
  };

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else if (playing) {
      void audioRef.current?.play();
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
      void audioRef.current.play();
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

  useInterval(
    () => {
      revalidate();
    },
    // -> checks if user started playing every minute
    playback ? null : 60000,
    // -> refreshes every 30s regardless
    // 30000,
  );
  // const interval = useCallback(
  //   () => setInterval(() => setPlayingFrom(!playingFrom), 6900),
  //   [playingFrom],
  // );

  // useEffect(() => {
  //   if (
  //     track.album.album_type === 'single' &&
  //     track.album.total_tracks === 1 &&
  //     playback?.context?.type !== 'artist' &&
  //     playback?.context?.type !== 'playlist'
  //   ) {
  //     clearInterval(interval());
  //     setPlayingFrom(false);
  //   } else {
  //     interval();
  //   }
  // }, [playback.context, interval, track.album.album_type, track.album.type, track.album.total_tracks]);

  if (!playback) return null;
  const { track } = playback;

  return (
    <>
      <Stack pos="sticky" top={0} zIndex={1} spacing={-1} overflowY={['scroll', 'visible']}>
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
                      onMouseDown={onMouseDown}
                      onMouseMove={onMouseMove}
                      onClick={() => onClick(drawerTrack)}
                      cursor="pointer"
                      w={['200px', '68%']}
                      overflow="hidden"
                      whiteSpace="nowrap"
                    >
                      {track.name}
                    </Text>
                    <Flex
                      onMouseDown={onMouseDown}
                      onMouseMove={onMouseMove}
                      onClick={() => onClick(drawerTrack)}
                      cursor="pointer"
                      w={['200px', '68%']}
                    >
                      {track.explicit && <Image mr={1} src={explicitImage} w="19px" />}
                      <Text opacity={0.8} fontSize="13px" noOfLines={1}>
                        {track.artist}
                      </Text>
                    </Flex>
                    {/* <Stack spacing={1} pos="absolute" pt="48px" lineHeight="shorter" w="100%">
                      <Text
                        fontSize="13px"
                        fontWeight="normal"
                        transition="opacity 1.69s ease-in-out"
                        // opacity={playingFrom ? 0 : 1}
                        opacity={1}
                        noOfLines={1}
                        w={['200px', '68%']}
                      >
                        Listening on
                      </Text>
                      <Text
                        fontSize="15px"
                        fontWeight="bold"
                        transition="opacity 1.69s ease-in-out"
                        // opacity={playingFrom ? 0 : 1}
                        opacity={1}
                        noOfLines={1}
                        w={['200px', '68%']}
                      >
                        {playback.device.name.split(' ').slice(0, 2).join(' ')}
                      </Text>
                    </Stack> */}
                  </Stack>
                  <HStack>
                    <HStack mb="5px !important" mt="40px">
                      <SpotifyLogo icon={isSmallScreen} />
                      {/* {party.length && (
                        <AvatarGroup size="xs" spacing={-2} max={5}>
                          {party.map((u) => {
                            return <Avatar key={u.userId} name={u.userName} src={u.userImage} />;
                          })}
                        </AvatarGroup>
                      )} */}
                      {/* {!isOwnProfile && (
                        <> */}
                      {/* <Tooltip label={isUserInParty ? 'Leave session' : 'Join session'}>
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
                      </Tooltip> */}
                      {isOwnProfile ? (
                        <>
                          {/* <PlayController fetcher={fetcher} playback={playback} id={id} /> */}
                        </>
                      ) : (
                        <Tooltip
                          label={hasPreview ? '' : 'song has no preview'}
                          openDelay={hasPreview ? 200 : 0}
                          // closeOnClick <- does not work because the icon changes >:( so annoying!!!!
                        >
                          <IconButton
                            onClick={handleMusicControls}
                            icon={icon}
                            variant="ghost"
                            aria-label={playing ? 'pause' : 'play'}
                            _hover={{ color: 'spotify.green' }}
                            _active={{ boxShadow: 'none' }}
                            onMouseLeave={handleMouseLeavePreviewButton}
                            onMouseEnter={handleMouseEnterPreviewButton}
                            color={color1}
                          />
                        </Tooltip>
                      )}

                      {/* </>
                      )} */}
                    </HStack>
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
                                  transition="width 0.25s, height 0.25s"
                                />
                              </Tooltip>
                            ) : (
                              <Link href={playback.context?.uri} target="_blank">
                                <Tooltip label={playback.context.name} placement="bottom-end">
                                  <Image
                                    src={playback.context.image}
                                    boxSize={{ base: '45px', sm: '75px', lg: '108px' }}
                                    transition="width 0.25s, height 0.25s"
                                  />
                                </Tooltip>
                              </Link>
                            ))} */}
                  {/* <Link href={albumLink ?? ''} target="_blank"> */}
                  <Tooltip label={track.albumName} placement="bottom-end">
                    <Image
                      src={track.image}
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
                      transition="width 0.25s, height 0.25s, margin-top 0.25s, min-width 0.25s"
                      pos="absolute"
                      right={0}
                      top={0}
                      onMouseDown={onMouseDown}
                      onMouseMove={onMouseMove}
                      onClick={() => onClick(drawerTrack)}
                      cursor="pointer"
                    />
                  </Tooltip>
                  {/* </Link> */}
                </HStack>
              </Flex>
              {/* <PlayerBar playback={playback} /> */}
            </Stack>
          </Collapse>
        </Stack>
        <Box
          w="-webkit-fit-content"
          bg={bg}
          borderRadius="0px 0px 3px 3px"
          zIndex={-1}
          backdropFilter={!isSmallScreen ? 'blur(27px)' : 'none'}
          alignSelf={currentUser?.settings?.playerButtonRight ? 'end' : 'unset'}
        >
          <IconButton
            icon={isOpen ? <ArrowDown2 /> : <ArrowUp2 />}
            variant="ghost"
            onClick={() => {
              onToggle();
              setBlur(true);
            }}
            aria-label={isOpen ? 'open player' : 'close player'}
            _hover={{ color: 'spotify.green', opacity: 1 }}
            opacity={isSmallScreen ? 1 : 0.5}
            _active={{ boxShadow: 'none' }}
            boxShadow="none"
            color={color}
          />
        </Box>
        {track.preview_url && <audio autoPlay={preview} ref={audioRef} src={track.preview_url} />}
      </Stack>
    </>
  );
};
export default PlayerPrisma;
