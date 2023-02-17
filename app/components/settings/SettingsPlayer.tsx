import { useEffect, useState } from 'react';

import {
  Box,
  Flex,
  HStack,
  IconButton,
  Image,
  Stack,
  Text,
  useColorModeValue,
  Collapse,
  useDisclosure,
} from '@chakra-ui/react';

import type { Track } from '@prisma/client';
import { ArrowDown2, ArrowUp2 } from 'iconsax-react';

import explicitImage from '~/assets/explicit-solid.svg';
import musyIcon from '~/assets/musySquareIcon.png';
import useIsMobile from '~/hooks/useIsMobile';
import useSessionUser from '~/hooks/useSessionUser';

import SpotifyLogo from '../icons/SpotifyLogo';

const SettingsPlayer = ({ track }: { track: Track | undefined }) => {
  const song = track ?? {
    albumName: 'Album',
    albumUri: '',
    artist: 'Artist',
    artistUri: '',
    duration: 0,
    explicit: false,
    id: '',
    image: musyIcon,
    link: '',
    name: 'Song Name',
    preview_url: null,
    uri: '',
  };

  const currentUser = useSessionUser();
  const [size, setSize] = useState('large');
  const [blur, setBlur] = useState(true);

  const { isOpen, onToggle } = useDisclosure();
  // const { onClick, onMouseDown, onMouseMove } = useClickDrag();

  const bg = useColorModeValue('music.50', '#10101066');
  const color = useColorModeValue('#10101066', 'music.50');

  const isSmallScreen = useIsMobile();

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

  return (
    <Stack pos="sticky" top={isOpen ? ['47px', 0] : ['42px', 0]} zIndex={1} spacing={-1} mt="10px">
      <Stack backdropFilter="blur(27px)" borderRadius={size === 'small' ? 0 : 5} h="100%">
        <Collapse in={!isOpen} animateOpacity>
          <Stack spacing={0} bg={bg} backdropFilter={blur && isSmallScreen ? 'blur(27px)' : 'none'}>
            <Flex h="135px" px="2px" py="2px" justify="space-between">
              <Stack pl="7px" spacing={1} flexGrow={1}>
                <Stack direction="column" spacing={0.5}>
                  <Text
                    noOfLines={1}
                    // onMouseDown={onMouseDown}
                    // onMouseMove={onMouseMove}
                    cursor="pointer"
                    w={['190px', '68%']}
                    textOverflow="ellipsis"
                  >
                    {song.name}
                  </Text>
                  <Flex
                    // onMouseDown={onMouseDown}
                    // onMouseMove={onMouseMove}
                    cursor="pointer"
                    w={['200px', '68%']}
                  >
                    {song.explicit && <Image mr={1} src={explicitImage} w="19px" />}
                    <Text opacity={0.8} fontSize="13px" noOfLines={1} textOverflow="ellipsis">
                      {song.artist}
                    </Text>
                  </Flex>
                </Stack>
                <HStack>
                  <HStack mb="5px !important" mt="40px">
                    <SpotifyLogo icon={isSmallScreen} />
                  </HStack>
                </HStack>
              </Stack>
              <HStack spacing={1} align="end">
                <Image
                  src={song.image}
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
                  minH={
                    size === 'large'
                      ? [135, 160, 160, 200, 334]
                      : size === 'medium'
                      ? [135, 160, 160, 200, 221]
                      : 135
                  }
                  transition="all 0.25s"
                  pos="absolute"
                  right={0}
                  top={0}
                  // onMouseDown={onMouseDown}
                  // onMouseMove={onMouseMove}
                  cursor="pointer"
                />
              </HStack>
            </Flex>
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
    </Stack>
  );
};
export default SettingsPlayer;
