import { useRevalidator } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';

import {
  Box,
  Flex,
  HStack,
  IconButton,
  Image,
  Stack,
  Text,
  useColorModeValue,
  useInterval,
  Collapse,
  useDisclosure,
} from '@chakra-ui/react';

import type { Party, Playback, Track } from '@prisma/client';
import { motion } from 'framer-motion';
import { ArrowDown2, ArrowUp2, PauseCircle, PlayCircle } from 'iconsax-react';

import explicitImage from '~/assets/explicit-solid.svg';
import { useClickDrag, useDrawerIsPlaying, useDrawerTrack } from '~/hooks/useDrawer';
import useIsMobile from '~/hooks/useIsMobile';
import useSessionUser from '~/hooks/useSessionUser';
import { useThemePlayer } from '~/hooks/useTheme';

import AudioVisualizer from '../../icons/AudioVisualizer';
import SpotifyLogo from '../../icons/SpotifyLogo';
import Tooltip from '../../Tooltip';

type PlayerProps = {
  id: string;
  layoutKey: string;
  name: string;
  party: Party[];
  playback: Playback & {
    track: Track;
  };
};

const PlayerPrisma = ({ id, layoutKey, playback }: PlayerProps) => {
  const currentUser = useSessionUser();
  const { bg, blurPlayer, main, sub } = useThemePlayer();
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
  const isPlaying = useDrawerIsPlaying();
  // eslint-disable-next-line
  const dontRemoveThis = useDrawerTrack();

  const color1 = useColorModeValue('music.800', 'music.200');

  const { revalidate } = useRevalidator();
  const isSmallScreen = useIsMobile();

  const audioRef = useRef<HTMLAudioElement>(null);

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
  }, []);

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
    playback ? null : 60000,
  );

  if (!playback) return null;
  const { track } = playback;

  return (
    <Stack pos="sticky" top={isOpen ? ['47px', 0] : ['42px', 0]} zIndex={1} spacing={0}>
      <Stack
        backdropFilter={blurPlayer && blur ? 'blur(27px)' : 'none'}
        borderRadius={size === 'small' ? 0 : 5}
        h="100%"
      >
        <Box as={Collapse} in={!isOpen} animateOpacity overflow="visible !important">
          <Stack
            spacing={0}
            bg={bg}
            backdropFilter={blurPlayer && blur && isSmallScreen ? 'blur(27px)' : 'none'}
          >
            <Flex h="135px" px="2px" py="2px" justify="space-between">
              <Stack pl="7px" spacing={1} flexGrow={1}>
                <Stack direction="column" spacing={0.5}>
                  <Text
                    noOfLines={1}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onClick={() => onClick(track, id, layoutKey, [track], 0)}
                    cursor="pointer"
                    w={['200px', '68%']}
                    overflow="hidden"
                    whiteSpace="nowrap"
                    color={main}
                  >
                    {track.name}
                  </Text>
                  <Flex
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onClick={() => onClick(track, id, layoutKey, [track], 0)}
                    cursor="pointer"
                    w={['200px', '68%']}
                  >
                    {track.explicit && <Image mr={1} src={explicitImage} w="19px" />}
                    <Text opacity={0.8} fontSize="13px" noOfLines={1} color={sub}>
                      {track.artist}
                    </Text>
                  </Flex>
                </Stack>
                <HStack>
                  <HStack mb="5px !important" mt="40px">
                    <SpotifyLogo icon={isSmallScreen} />
                    {hasPreview && (
                      <IconButton
                        onClick={handleMusicControls}
                        icon={icon}
                        variant="ghost"
                        aria-label={playing ? 'pause' : 'play'}
                        _hover={{ color: main }}
                        _active={{ boxShadow: 'none' }}
                        onMouseLeave={handleMouseLeavePreviewButton}
                        onMouseEnter={handleMouseEnterPreviewButton}
                        color={color1}
                      />
                    )}
                  </HStack>
                </HStack>
              </Stack>
              <HStack spacing={1} align="end">
                <Tooltip label={track.albumName} placement="bottom-end">
                  <Image
                    as={motion.img}
                    layoutId={track.id + layoutKey}
                    zIndex={9}
                    src={track.image}
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
                    minH={
                      size === 'large'
                        ? [135, 160, 160, 200, 334]
                        : size === 'medium'
                        ? [135, 160, 160, 200, 221]
                        : 135
                    }
                    transition="width 0.25s, height 0.25s"
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onClick={() => onClick(track, id, layoutKey, [track], 0)}
                    cursor="pointer"
                  />
                </Tooltip>
              </HStack>
            </Flex>
          </Stack>
        </Box>
      </Stack>
      <Box
        w="-webkit-fit-content"
        bg={bg}
        borderRadius="0px 0px 3px 3px"
        zIndex={-1}
        backdropFilter={blurPlayer && !isSmallScreen ? 'blur(27px)' : 'none'}
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
          _hover={{ color: main, opacity: 1 }}
          opacity={isSmallScreen ? 1 : 0.5}
          _active={{}}
          boxShadow="none"
          color={sub}
        />
      </Box>
      {track.preview_url && <audio autoPlay={preview} ref={audioRef} src={track.preview_url} />}
    </Stack>
  );
};
export default PlayerPrisma;
