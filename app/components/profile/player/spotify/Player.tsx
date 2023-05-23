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

import type { Party } from '@prisma/client';
import { ArrowDown2, ArrowUp2, PauseCircle, People, PlayCircle } from 'iconsax-react';

import Tooltip from '~/components/Tooltip';
import { useClickDrag, useExpandedIsPlaying } from '~/hooks/useExpandedTileState';
import useIsMobile from '~/hooks/useIsMobile';
import useSessionUser from '~/hooks/useSessionUser';
import explicitImage from '~/lib/assets/explicit-solid.svg';
import AudioVisualizer from '~/lib/icons/AudioVisualizer';
import SpotifyLogo from '~/lib/icons/SpotifyLogo';
import type { CurrentlyPlayingObjectCustom } from '~/services/spotify.server';

import PlayController from '../PlayController';
import PlayingFromTooltip from '../PlayingFromTooltip';
import PlayerBar from './PlayerBar';

type PlayerProps = {
  id: string;
  item: SpotifyApi.TrackObjectFull;
  layoutKey: string;
  party: Party[];
  playback: CurrentlyPlayingObjectCustom;
};

const Player = ({ id, item, layoutKey, party, playback }: PlayerProps) => {
  const currentUser = useSessionUser();
  const isOwnProfile = currentUser?.userId === id;
  const preview = currentUser?.settings?.allowPreview === true && !isOwnProfile;
  const [hasPreview, setHasPreview] = useState<boolean>();
  const [playing, setPlaying] = useState(preview);
  const [showPause, setShowPause] = useState(true);
  const [hovering, setHovering] = useState<boolean>();
  const [size, setSize] = useState('large');
  const [blur, setBlur] = useState(true);

  const { isOpen, onToggle } = useDisclosure();
  const { onClick, onMouseDown, onMouseMove } = useClickDrag();
  const isPlaying = useExpandedIsPlaying();

  const bg = useColorModeValue('musy.50', '#10101066');
  const color = useColorModeValue('#10101066', 'musy.50');
  const color1 = useColorModeValue('musy.800', 'musy.200');

  const isUserInParty = party.some((e) => e.userId === currentUser?.userId);
  const fetcher = useFetcher();
  const { revalidate } = useRevalidator();
  const busy = fetcher.formData?.has('party') ?? false;
  const isSmallScreen = useIsMobile();

  const audioRef = useRef<HTMLAudioElement>(null);

  const track = {
    albumName: item.album.name,
    albumUri: item.album.uri,
    artist: item.artists[0].name,
    artistUri: item.artists[0].uri,
    duration: 0,
    explicit: item.explicit,
    id: item.id,
    image: item.album?.images[0].url,
    link: item.external_urls.spotify,
    name: item.name,
    preview_url: item.preview_url,
    uri: item.uri,
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

  const active = playback.is_playing;
  useInterval(
    () => {
      revalidate();
    },
    // -> checks if user started playing every minute
    active ? null : 60000,
    // -> refreshes every 30s regardless
  );

  if (!item) return null;

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
                      onClick={() => onClick(track, id, layoutKey, [], 0)}
                      cursor="pointer"
                      w={['200px', '68%']}
                      overflow="hidden"
                      whiteSpace="nowrap"
                    >
                      {item.name}
                    </Text>
                    <Flex
                      onMouseDown={onMouseDown}
                      onMouseMove={onMouseMove}
                      onClick={() => onClick(track, id, layoutKey, [], 0)}
                      cursor="pointer"
                      w={['200px', '68%']}
                    >
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
                          // opacity={playingFrom ? 1 : 0}
                          opacity={0}
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
                            opacity={0}
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
                        opacity={1}
                        noOfLines={1}
                        w={['200px', '68%']}
                      >
                        {playback.device.name.split(' ').slice(0, 2).join(' ')}
                      </Text>
                    </Stack>
                  </Stack>
                  <HStack>
                    {active ? (
                      <HStack mb="5px !important" mt={!playback.context ? '46px' : 0}>
                        <SpotifyLogo icon={isSmallScreen} />
                        {isOwnProfile && (
                          <PlayController fetcher={fetcher} playback={playback} id={id} />
                        )}
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
                                onClick={() => {
                                  fetcher.submit(
                                    { userId: id },
                                    {
                                      action: isUserInParty ? 'api/party/leave' : 'api/party/join',
                                      method: 'post',
                                      replace: true,
                                    },
                                  );
                                }}
                              />
                            </Tooltip>
                            <Tooltip
                              label={hasPreview ? '' : 'song has no preview'}
                              openDelay={hasPreview ? 200 : 0}
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
                          </>
                        )}
                      </HStack>
                    ) : (
                      <HStack>
                        <SpotifyLogo />
                        {isOwnProfile && (
                          <PlayController fetcher={fetcher} playback={playback} id={id} />
                        )}
                      </HStack>
                    )}
                  </HStack>
                </Stack>

                <HStack spacing={1} align="end">
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
                      transition="width 0.25s, height 0.25s, margin-top 0.25s, min-width 0.25s"
                      pos="absolute"
                      right={0}
                      top={0}
                      onMouseDown={onMouseDown}
                      onMouseMove={onMouseMove}
                      onClick={() => onClick(track, id, layoutKey, [], 0)}
                      cursor="pointer"
                    />
                  </Tooltip>
                </HStack>
              </Flex>
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
            _hover={{ color: 'spotify.green', opacity: 1 }}
            opacity={isSmallScreen ? 1 : 0.5}
            _active={{ boxShadow: 'none' }}
            boxShadow="none"
            color={color}
          />
        </Box>
        {item.preview_url && <audio autoPlay={preview} ref={audioRef} src={item.preview_url} />}
      </Stack>
    </>
  );
};
export default Player;
