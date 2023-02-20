import { useState } from 'react';

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

import type { Theme, Track } from '@prisma/client';
import { ArrowDown2, ArrowUp2 } from 'iconsax-react';

import explicitImage from '~/assets/explicit-solid.svg';
import musyIcon from '~/assets/musySquareIcon.png';
import useIsMobile from '~/hooks/useIsMobile';
import useSessionUser from '~/hooks/useSessionUser';

import SpotifyLogo from '../../icons/SpotifyLogo';

const SettingsPlayer = ({ theme, track }: { theme: Theme; track: Track | undefined }) => {
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
  const [blur, setBlur] = useState(true);

  const { isOpen, onToggle } = useDisclosure();

  const bg = useColorModeValue(theme.playerColorLight + '66', theme.playerColorDark + '66');
  const color = useColorModeValue('#10101066', 'music.50');
  const main = useColorModeValue(theme.mainTextLight ?? '#161616', theme.mainTextDark ?? '#EEE6E2');

  const isSmallScreen = useIsMobile();

  return (
    <Stack zIndex={1} spacing={-1} mt="10px" px="5px">
      <Stack backdropFilter="blur(27px)" h="100%" zIndex={1}>
        <Collapse in={!isOpen} animateOpacity>
          <Stack spacing={0} bg={bg} backdropFilter={blur && isSmallScreen ? 'blur(27px)' : 'none'}>
            <Flex h="135px" px="2px" py="2px" justify="space-between">
              <Stack pl="7px" spacing={1} flexGrow={1}>
                <Stack direction="column" spacing={0.5}>
                  <Text noOfLines={1} w={['190px', '220px']} textOverflow="ellipsis" color={main}>
                    {song.name}
                  </Text>
                  <Flex w={['200px', '68%']}>
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
                <Image src={song.image} boxSize={135} minW={135} minH={135} />
              </HStack>
            </Flex>
          </Stack>
        </Collapse>
      </Stack>
      <Box
        w="-webkit-fit-content"
        bg={bg}
        borderRadius="0px 0px 3px 3px"
        zIndex={0}
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
          _hover={{ color: main, opacity: 1 }}
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
