import { Link, useTransition } from '@remix-run/react';

import {
  Button,
  Flex,
  HStack,
  Image,
  Stack,
  Text,
  useColorModeValue,
  Link as LinkB,
  Box,
} from '@chakra-ui/react';

import type { Playback, Profile, Track } from '@prisma/client';

import explicitImage from '~/assets/explicit-solid.svg';
import { useDrawerActions } from '~/hooks/useDrawer';
import useIsMobile from '~/hooks/useIsMobile';
import type { User } from '~/lib/types/types';

import SpotifyLogo from '../../icons/SpotifyLogo';
import Waver from '../../icons/Waver';
import Tooltip from '../../Tooltip';

interface Friends extends User {
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
}
type PlayerProps = {
  currentUserId: string | undefined;
  index: number;
  layoutKey: string;
  tracks: Track[];
  user: Friends;
};

const PrismaMiniPlayer = ({ index, layoutKey, tracks, user }: PlayerProps) => {
  const bg = useColorModeValue('music.200', 'music.900');
  const hoverBg = useColorModeValue('music.50', '#5F5B59');
  const color = useColorModeValue('music.900', 'music.200');
  const transition = useTransition();
  const isSmallScreen = useIsMobile();
  const { onOpen } = useDrawerActions();

  const [first, second = ''] = user.name.split(/[\s.]+/);
  const name = second.length > 4 || first.length >= 6 ? first : [first, second].join(' ');
  const loading = transition.location?.pathname.includes(user.userId);

  const playback = user.playback;
  const track = playback?.track;

  const formattedTrack = track
    ? {
        albumName: track.albumName,
        albumUri: track.albumUri,
        artist: track.artist,
        artistUri: track.artistUri,
        duration: 0,
        explicit: track.explicit,
        id: track.id,
        image: track.image,
        link: track.link,
        name: track.name,
        preview_url: track.preview_url,
        uri: track.uri,
      }
    : null;

  const ProfilePic = (
    <Image
      boxSize={['50px', '100px']}
      borderRadius="100%"
      minH={['50px', '100px']}
      minW={['50px', '100px']}
      src={user.image}
    />
  );
  const Username = (
    <Text fontWeight="bold" fontSize={['15px', '20px']}>
      {name}
    </Text>
  );
  const User = (
    <Stack justifySelf="left">
      <Stack direction="row" w="100%">
        {ProfilePic}
        <HStack>
          <Stack>
            {isSmallScreen && !user.bio && loading && track ? (
              <Stack ml="8px">
                <Waver />
              </Stack>
            ) : (
              Username
            )}
            {isSmallScreen && user.bio && loading && track ? (
              <Waver />
            ) : user.bio ? (
              <Stack maxW={['40px', '100%']}>
                <Text opacity={0.8} fontSize={{ base: 'smaller', md: 'xs' }} h="20px">
                  {user.bio.slice(0, 15)}
                </Text>
              </Stack>
            ) : null}
          </Stack>
          {!isSmallScreen && loading && <Waver />}
        </HStack>
      </Stack>
    </Stack>
  );
  const Activity = (
    <>
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
          </Stack>
          <Tooltip label={<Text>{track.name}</Text>}>
            <LinkB
              as="span"
              onClick={(e) => {
                e.preventDefault();
                formattedTrack && onOpen(formattedTrack, user.userId, layoutKey, tracks, index);
              }}
            >
              <Image
                src={track.image}
                m={0}
                boxSize={track ? ['100px', '200px'] : '60px'}
                minH={track ? ['100px', '200px'] : '60px'}
                maxH={track ? ['100px', '200px'] : '60px'}
                minW={track ? ['100px', '200px'] : '60px'}
                maxW={track ? ['100px', '200px'] : '60px'}
              />
            </LinkB>
          </Tooltip>
        </HStack>
      ) : (
        isSmallScreen &&
        loading && (
          <Box pl="20px">
            <Waver />
          </Box>
        )
      )}
    </>
  );

  return (
    <Button
      as={Link}
      to={`/${user.userId}`}
      prefetch="intent"
      bg={loading ? hoverBg : bg}
      color={color}
      px={['4px', 0]}
      pl={[0, '10px']}
      variant="ghost"
      h={track ? ['100px', '200px'] : '120px'}
      minW="100%"
      maxW="100%"
      borderRadius={5}
      _hover={isSmallScreen && !loading ? { bg } : { bg: hoverBg }}
      justifyContent="left"
    >
      {User}
      {Activity}
    </Button>
  );
};
export default PrismaMiniPlayer;
