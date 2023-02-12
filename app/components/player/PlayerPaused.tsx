import { useEffect, useRef, useState } from 'react';

import {
  Flex,
  HStack,
  IconButton,
  Image,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
  Collapse,
  Box,
} from '@chakra-ui/react';

import { ArrowDown2, ArrowUp2, PauseCircle, PlayCircle } from 'iconsax-react';

import explicitImage from '~/assets/explicit-solid.svg';
import { useDrawerActions, useDrawerIsPlaying } from '~/hooks/useDrawer';
import useIsMobile from '~/hooks/useIsMobile';
import useSessionUser from '~/hooks/useSessionUser';

import AudioVisualizer from '../icons/AudioVisualizer';
import SpotifyLogo from '../icons/SpotifyLogo';
import Tooltip from './../Tooltip';

type PlayerPausedProps = {
  item: SpotifyApi.TrackObjectFull;
  // profileSong: (Settings & { profileSong: Track | null }) | null;
  profileSong: any;
  username: string;
};

const PlayerPaused = ({ item, profileSong }: PlayerPausedProps) => {
  const currentUser = useSessionUser();
  const preview = currentUser !== null && currentUser.settings?.allowPreview === true;
  const [size, setSize] = useState<string>('Large');
  const [playing, setPlaying] = useState(preview);
  const [showPause, setShowPause] = useState(true);
  const [hovering, setHovering] = useState<boolean>();
  const [hasPreview, setHasPreview] = useState<boolean>();
  const [song, setSong] = useState(item);
  const [image, setImage] = useState(profileSong ? profileSong.image : song.album?.images[1].url);
  const [artist, setArtist] = useState(profileSong ? profileSong.artist : song.artists[0].name);
  const { isOpen, onToggle } = useDisclosure();
  const [blur, setBlur] = useState(true);
  const { onOpen } = useDrawerActions();
  const isPlaying = useDrawerIsPlaying();
  const bg = useColorModeValue('music.50', '#10101066');
  const explicit = song.explicit;
  const name = song.name;

  const audioRef = useRef<HTMLAudioElement>(null);

  const track = {
    albumName: profileSong ? profileSong.albumName : song.album.name,
    albumUri: profileSong ? profileSong.albumUri : song.album.uri,
    artist,
    artistUri: profileSong ? profileSong.artistUri : song.artists[0].uri,
    duration: 0,
    explicit: song.explicit,
    id: song.id,
    image,
    link: profileSong ? profileSong.link : song.external_urls.spotify,
    name,
    preview_url: song.preview_url,
    uri: song.uri,
  };

  const isSmallScreen = useIsMobile();

  const onClick = () => {
    if (audioRef.current && !playing) {
      void audioRef.current.play();
      setPlaying(true);
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
    if (profileSong) {
      setSong(profileSong);
      setImage(profileSong.image);
      setArtist(profileSong.artist);
    }
  }, [profileSong]);

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
    setSize('large');
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

  return (
    <>
      <Stack pos="sticky" top={0} zIndex={10} spacing={0}>
        <Stack
          backdropFilter="blur(27px)"
          spacing={0}
          borderRadius={size === 'small' ? 0 : 5}
          zIndex={2}
        >
          <Collapse in={!isOpen} animateOpacity unmountOnExit>
            <Stack
              w={[363, '100%']}
              bg={bg}
              spacing={0}
              borderRadius={size === 'small' ? 0 : 5}
              minH={138}
              backdropFilter={blur && isSmallScreen ? 'blur(27px)' : 'none'}
            >
              <HStack minH={138} spacing={2} px="2px" py="2px" justify="space-between">
                <Stack
                  pl="7px"
                  spacing={2}
                  minH={130}
                  flexGrow={1}
                  direction="column"
                  justify="space-between"
                >
                  <Stack>
                    <Text
                      noOfLines={[1]}
                      onClick={() => onOpen(track)}
                      cursor="pointer"
                      w={['200px', '68%']}
                    >
                      {name}
                    </Text>
                    <Flex onClick={() => onOpen(track)} cursor="pointer" w={['200px', '68%']}>
                      {explicit && <Image mr={1} src={explicitImage} w="19px" />}
                      <Text opacity={0.8} fontSize="13px" noOfLines={1}>
                        {artist}
                      </Text>
                    </Flex>
                  </Stack>
                  <HStack alignItems="flex-end" w="fit-content" h="35px">
                    <SpotifyLogo mt="46px" />
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
                        onMouseEnter={handleMouseEnterPreviewButton}
                        onMouseLeave={handleMouseLeavePreviewButton}
                      />
                    </Tooltip>
                  </HStack>
                </Stack>
                <Stack>
                  <Tooltip
                    label={profileSong ? profileSong.albumName : song.album.name}
                    placement="bottom-end"
                  >
                    <Image
                      src={image}
                      mt={
                        size === 'large'
                          ? [0, -47, -47, -47, -200]
                          : size === 'medium'
                          ? [0, -47, -47, -47, '-86px']
                          : 0
                      }
                      boxSize={
                        size === 'large'
                          ? [108, 160, 334]
                          : size === 'medium'
                          ? [108, 160, 221]
                          : 108
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
                      transition="width 0.25s, height 0.25s, margin-top 0.25s, min-width 0.25s, min-height 0.25s"
                      pos="absolute"
                      right={0}
                      top={0}
                      onClick={() => onOpen(track)}
                      cursor="pointer"
                    />
                  </Tooltip>
                </Stack>
              </HStack>
            </Stack>
          </Collapse>
        </Stack>
        <Box
          w="-webkit-fit-content"
          bg={bg}
          backdropFilter={!isSmallScreen ? 'blur(27px)' : 'none'}
          borderRadius="0px 0px 3px 3px"
          zIndex={-1}
        >
          <IconButton
            icon={isOpen ? <ArrowDown2 /> : <ArrowUp2 />}
            variant="ghost"
            onClick={() => {
              onToggle();
              setBlur(true);
            }}
            aria-label={!isOpen ? 'open player' : 'close player'}
            _hover={{ color: 'spotify.green', opacity: 1 }}
            opacity={isSmallScreen ? 1 : 0.5}
            _active={{ boxShadow: 'none' }}
            boxShadow="none"
          />
        </Box>
        {song.preview_url && <audio autoPlay={preview} ref={audioRef} src={song.preview_url} />}
      </Stack>
    </>
  );
};
export default PlayerPaused;
