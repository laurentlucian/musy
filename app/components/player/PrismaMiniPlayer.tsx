import {
  Button,
  Flex,
  HStack,
  Image,
  Stack,
  Text,
  Icon,
  useColorModeValue,
  Link as LinkB,
  AvatarGroup,
  Avatar,
  Box,
} from '@chakra-ui/react';
import type { Playback, Profile, Settings, Track } from '@prisma/client';
import explicitImage from '~/assets/explicit-solid.svg';
import { Link, useTransition } from '@remix-run/react';
import { useDrawerActions } from '~/hooks/useDrawer';
import SpotifyLogo from '../icons/SpotifyLogo';
import useIsMobile from '~/hooks/useIsMobile';
import PlayedBy from '../activity/PlayedBy';
import { Heart } from 'iconsax-react';
import Waver from '../icons/Waver';
import Tooltip from '../Tooltip';

// import PlayerBarCSS from './PlayerBarCSS';

type PlayerProps = {
  user: Profile & {
    settings: Settings | null;
    playback:
      | (Playback & {
          track: Track & {
            liked: {
              user: Profile | null;
            }[];
            recent: {
              user: Profile;
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
        link: track.link,
        image: track.image,
        albumUri: track.albumUri,
        albumName: track.albumName,
        artist: track.artist,
        artistUri: track.artistUri,
        userId: user.userId,
      }
    : null;

  return (
    <Stack
      minW={['370px', '100%']}
      maxW={['370px', '100%']}
      bg={bg}
      spacing={0}
      borderRadius={5}
      ml="-4px !important"
    >
      <Button
        as={Link}
        to={`/${user.userId}`}
        variant="ghost"
        color={color}
        h={track ? ['100px', '120px'] : '65px'}
        minW={['370px', '100%']}
        maxW={['370px', '100%']}
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
            {isSmallScreen && transition.location?.pathname.includes(user.userId) ? (
              <Waver />
            ) : (
              <Stack maxW={['40px', '100%']}>
                <Text opacity={0.8} fontSize={{ base: 'smaller', md: 'xs' }}>
                  {user.bio?.slice(0, 15)}
                </Text>
              </Stack>
            )}
          </Stack>

          {track ? (
            <HStack w="100%" spacing={2} justify="end">
              <Stack spacing={1} h="100%" align="end">
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
                  {track.explicit ? (
                    <Image mr={1} src={explicitImage} minW="16px" maxW="16px" />
                  ) : (
                    <Box minW="16px" maxW="16px" />
                  )}
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
                <Stack pt="10px" my="30px">
                  <SpotifyLogo h="22px" w="70px" />
                </Stack>

                {/* {track.liked.length ? (
                  <HStack>
                    <Icon as={Heart} />
                    <AvatarGroup size="xs" max={4}>
                      {track.liked
                        // .filter(({ user: u }) => u?.userId !== user.userId)
                        .map(({ user }, index) => (
                          <Avatar
                            minW="20px"
                            maxW="20px"
                            minH="20px"
                            maxH="20px"
                            key={index}
                            name={user?.name}
                            src={user?.image}
                            size={['xs', null, 'sm']}
                          />
                        ))}
                    </AvatarGroup>
                  </HStack>
                ) : null}
                {track.recent.length ? <PlayedBy played={track.recent} /> : null} */}
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
                    minH={track ? ['100px', '120px'] : '60px'}
                    maxH={track ? ['100px', '120px'] : '60px'}
                    minW={track ? ['100px', '120px'] : '60px'}
                    maxW={track ? ['100px', '120px'] : '60px'}
                  />
                </LinkB>
              </Tooltip>
            </HStack>
          ) : null}
        </HStack>
      </Button>
      {/* {playback && <PlayerBarCSS playback={playback} />} */}
    </Stack>
  );
};
export default PrismaMiniPlayer;
