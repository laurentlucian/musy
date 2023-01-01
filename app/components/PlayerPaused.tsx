import {
  Flex,
  HStack,
  IconButton,
  Image,
  Link,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
  Collapse,
  Box,
} from '@chakra-ui/react';
import Spotify_Logo_Black from '~/assets/Spotify_Logo_Black.png';
import Spotify_Logo_White from '~/assets/Spotify_Logo_White.png';
import explicitImage from '~/assets/explicit-solid.svg';
import { ArrowDown2, ArrowUp2 } from 'iconsax-react';
import type { Track } from '~/lib/types/types';
import { useDrawerActions } from '~/hooks/useDrawer';
import useIsMobile from '~/hooks/useIsMobile';
import { useEffect, useState } from 'react';
import Tooltip from './Tooltip';

type PlayerPausedProps = {
  item: SpotifyApi.TrackObjectFull;
  username: string;
};

const PlayerPaused = ({ item, username }: PlayerPausedProps) => {
  const [size, setSize] = useState<string>('Large');
  const { isOpen, onToggle } = useDisclosure();
  const [blur, setBlur] = useState(true);
  const { onOpen } = useDrawerActions();
  const bg = useColorModeValue('music.50', 'music.900');
  const spotify_logo = useColorModeValue(Spotify_Logo_Black, Spotify_Logo_White);
  const image = item.album?.images[1].url;
  const artist = item.artists[0].name;
  const explicit = item.explicit;
  const name = item.name;

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

  const isSmallScreen = useIsMobile();
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
                    <Link
                      href="https://open.spotify.com"
                      target="_blank"
                      height="30px"
                      width="98px"
                      mt="30px"
                      rel="external"
                    >
                      <Image height="30px" width="98px" src={spotify_logo} />
                    </Link>
                  </HStack>
                </Stack>
                <Stack>
                  <Tooltip label={item.album.name} placement="bottom-end">
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
                      borderRadius={size === 'small' ? 0 : 2}
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
export default PlayerPaused;
