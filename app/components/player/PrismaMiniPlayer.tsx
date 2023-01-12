import {
  Button,
  Flex,
  HStack,
  Image,
  Stack,
  Text,
  useColorModeValue,
  Link as LinkB,
} from '@chakra-ui/react';
import type { Playback, Profile, Track } from '@prisma/client';
import { Link, useTransition } from '@remix-run/react';
import explicitImage from '~/assets/explicit-solid.svg';
import { useDrawerActions } from '~/hooks/useDrawer';
import useIsMobile from '~/hooks/useIsMobile';
import Tooltip from '../Tooltip';
import Waver from '../Waver';
import PrismaPlayerbar from './PrismaPlayerBar';

type PlayerProps = {
  user: Profile;
  playback?: (Playback & { track: Track }) | null;
};

const PrismaMiniPlayer = ({ user, playback }: PlayerProps) => {
  const bg = useColorModeValue('music.200', 'music.900');
  const transition = useTransition();
  const isSmallScreen = useIsMobile();
  const { onOpen } = useDrawerActions();

  const [first, second = ''] = user.name.split(/[\s.]+/);
  const name = second.length > 4 || first.length >= 6 ? first : [first, second].join(' ');

  const track = playback?.track;

  const formattedTrack = track
    ? {
        uri: track.uri,
        trackId: track.id,
        name: track.name,
        explicit: track.explicit,
        image: track.image,
        albumUri: track.albumUri,
        albumName: track.albumName,
        artist: track.artist,
        artistUri: track.artistUri,
        userId: user.userId,
      }
    : null;

  return (
    <Stack w={[363, '100%']} bg={bg} spacing={0} borderRadius={5}>
      <Button
        as={Link}
        to={`/${user.userId}`}
        variant="ghost"
        h={track ? ['100px', '120px'] : '65px'}
        w={[363, '100%']}
        pr={0}
      >
        <HStack spacing={3} w="100%">
          <Image boxSize="50px" borderRadius="100%" minH="50px" minW="50px" src={user.image} />
          <Stack>
            <HStack>
              <Text fontWeight="bold" fontSize={['15px', '20px']}>
                {name}
              </Text>
              {!isSmallScreen && transition.location?.pathname.includes(user.userId) && <Waver />}
            </HStack>
            <Text opacity={0.8} fontSize={{ base: 'smaller', md: 'xs' }} pos="absolute" pt="20px">
              {user.bio?.slice(0, 15)}
            </Text>
            <Text opacity={0}>hiiii</Text>
          </Stack>

          {track ? (
            <HStack w="100%" spacing={2} justify="end">
              <Stack spacing={1} h="100%" align="end">
                {!isSmallScreen && (
                  <>
                    <LinkB
                      as="span"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(track.uri);
                      }}
                    >
                      <Text
                        noOfLines={[1]}
                        maxW={{ base: '110px', md: '300px', xl: 'unset' }}
                        fontSize={{ base: 'smaller', md: 'sm' }}
                      >
                        {track.name}
                      </Text>
                    </LinkB>
                    <Flex>
                      {track.explicit && <Image mr={1} src={explicitImage} w="16px" />}
                      <LinkB
                        as="span"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(track.artistUri);
                        }}
                      >
                        <Text
                          opacity={0.8}
                          noOfLines={[1]}
                          maxW={{ base: '110px', md: '300px', xl: 'unset' }}
                          fontSize={{ base: 'smaller', md: 'xs' }}
                        >
                          {track.artist}
                        </Text>
                      </LinkB>
                    </Flex>
                  </>
                )}
              </Stack>

              <Tooltip label={<Text>{track.name}</Text>}>
                <LinkB
                  as="span"
                  onClick={(e) => {
                    e.preventDefault();
                    formattedTrack && onOpen(formattedTrack);
                  }}
                >
                  <Image
                    src={track.image}
                    m={0}
                    boxSize={track ? ['100px', '120px'] : '60px'}
                    borderRadius={2}
                  />
                </LinkB>
              </Tooltip>
            </HStack>
          ) : null}
        </HStack>
      </Button>
      {playback && <PrismaPlayerbar playback={playback} />}
    </Stack>
  );
};
export default PrismaMiniPlayer;
