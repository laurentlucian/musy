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
import { useEffect, useState } from 'react';
import ActionMenu from './menu/ActionMenu';
import Tooltip from './Tooltip';
import useIsMobile from '~/hooks/useIsMobile';

type PlayerPausedProps = {
  item: SpotifyApi.TrackObjectFull;
  username: string;
};

const PlayerPaused = ({ item, username }: PlayerPausedProps) => {
  const bg = useColorModeValue('music.50', 'music.900');
  const bgMobile = useColorModeValue('music.100', 'music.800');
  const spotify_logo = useColorModeValue(Spotify_Logo_Black, Spotify_Logo_White);
  const link = item.uri;
  const artistLink = item.album?.artists[0].uri;
  const albumLink = item.album?.uri;
  const name = item.name;
  const artist = item.artists[0].name;
  const image = item.album?.images[1].url;
  const explicit = item.explicit;

  const [size, setSize] = useState<string>('Large');
  const { isOpen, onToggle } = useDisclosure();
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
            bg={isSmallScreen ? bgMobile : bg}
            spacing={0}
            borderRadius={size === 'small' ? 0 : 5}
            minH={138}
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
                  <Link href={link ?? ''} target="_blank">
                    <Text noOfLines={[1]}>{name}</Text>
                  </Link>
                  <Flex>
                    {explicit && <Image mr={1} src={explicitImage} w="19px" />}
                    <Link href={artistLink ?? ''} target="_blank">
                      <Text opacity={0.8} fontSize="13px">
                        {artist}
                      </Text>
                    </Link>
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
                  <ActionMenu
                    track={{
                      trackId: item.id,
                      uri: item.uri,
                      name: item.name,
                      artist: item.album?.artists[0].name,
                      artistUri: artistLink,
                      albumName: item.album?.name,
                      albumUri: albumLink,
                      explicit: item.explicit,
                      image: item.album?.images[0].url,
                    }}
                    // placement="bottom-start"
                    // offset={[-118, 0]}
                  />
                </HStack>
              </Stack>
              <Link href={albumLink} target="_blank">
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
                      size === 'large' ? [108, 160, 334] : size === 'medium' ? [108, 160, 221] : 108
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
                  />
                </Tooltip>
              </Link>
            </HStack>
          </Stack>
        </Collapse>
      </Stack>
      <Box
        w="-webkit-fit-content"
        bg={bg}
        backdropFilter="blur(27px)"
        borderRadius="0px 0px 3px 3px"
        zIndex={-1}
      >
        <IconButton
          icon={isOpen ? <ArrowDown2 /> : <ArrowUp2 />}
          variant="ghost"
          onClick={onToggle}
          aria-label={!isOpen ? 'open player' : 'close player'}
          _hover={{ opacity: 1, color: 'spotify.green' }}
          opacity={0.5}
          _active={{ boxShadow: 'none' }}
          boxShadow="none"
        />
      </Box>
    </Stack>
  );
};
export default PlayerPaused;
