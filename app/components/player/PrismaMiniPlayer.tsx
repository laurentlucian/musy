import {
  Button,
  Flex,
  HStack,
  Image,
  Stack,
  Text,
  useColorModeValue,
  Link as LinkB,
  AvatarGroup,
  Avatar,
} from '@chakra-ui/react';
import type { Playback, Profile, Settings, Track } from '@prisma/client';
import { Link, useTransition } from '@remix-run/react';
import explicitImage from '~/assets/explicit-solid.svg';
import { useDrawerActions } from '~/hooks/useDrawer';
import useIsMobile from '~/hooks/useIsMobile';
import Tooltip from '../Tooltip';
import Waver from '../Waver';
import PlayerBarCSS from './PlayerBarCSS';

type PlayerProps = {
  user: Profile & {
    settings: Settings | null;
    playback:
      | (Playback & {
          track: Track & {
            liked: {
              user: Profile | null;
            }[];
          };
        })
      | null;
  };
};

const PrismaMiniPlayer = ({ user }: PlayerProps) => {
  const bg = useColorModeValue('music.900', 'music.200');
  const color = useColorModeValue('music.200', 'music.900');
  const transition = useTransition();
  const isSmallScreen = useIsMobile();
  const { onOpen } = useDrawerActions();

  const [first, second = ''] = user.name.split(/[\s.]+/);
  const name = second.length > 4 || first.length >= 6 ? first : [first, second].join(' ');

  const playback = user.playback;
  const track = playback?.track;

  const formattedTrack = track
    ? {
        uri: track.uri,
        trackId: track.id,
        name: track.name,
        explicit: track.explicit,
        preview_url: '',
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
        color={color}
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
            <Text opacity={0.8} fontSize={{ base: 'smaller', md: 'xs' }}>
              {user.bio?.slice(0, 15)}
            </Text>
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
                    <AvatarGroup>
                      {track.liked
                        .filter(({ user: u }) => u?.userId !== user.userId)
                        .map(({ user }, index) => (
                          <Avatar
                            minW="25px"
                            maxW="25px"
                            minH="25px"
                            maxH="25px"
                            key={index}
                            name={user?.name}
                            src={user?.image}
                            size={['xs', null, 'sm']}
                          />
                        ))}
                    </AvatarGroup>
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
      {playback && <PlayerBarCSS playback={playback} />}
    </Stack>
  );
};
export default PrismaMiniPlayer;
