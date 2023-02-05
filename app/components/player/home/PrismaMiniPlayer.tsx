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
import QuickActions from './QuickActions';

// import PlayerBarCSS from './PlayerBarCSS';
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
  user: Friends;
};

const PrismaMiniPlayer = ({ currentUserId, user }: PlayerProps) => {
  const bg = useColorModeValue('music.200', 'music.900');
  const hoverBg = useColorModeValue('music.50', '#5F5B59');
  const color = useColorModeValue('music.900', 'music.200');
  const transition = useTransition();
  const isSmallScreen = useIsMobile();
  const { onOpen } = useDrawerActions();

  console.log(currentUserId, user.userId, 'currentUserId, user.userId');
  const [first, second = ''] = user.name.split(/[\s.]+/);
  const name = second.length > 4 || first.length >= 6 ? first : [first, second].join(' ');
  const loading = transition.location?.pathname.includes(user.userId);

  const playback = user.playback;
  const track = playback?.track;
  const que = user?.settings?.allowQueue;
  const recommend = user?.settings?.allowRecommend;

  const formattedTrack = track
    ? {
        albumName: track.albumName,
        albumUri: track.albumUri,
        artist: track.artist,
        artistUri: track.artistUri,
        explicit: track.explicit,
        image: track.image,
        link: track.link,
        name: track.name,
        preview_url: track.preview_url,
        trackId: track.id,
        uri: track.uri,
        userId: user.userId,
      }
    : null;

  const ProfilePic = (
    <Image boxSize="50px" borderRadius="100%" minH="50px" minW="50px" src={user.image} />
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
      {track && currentUserId !== user.userId ? (
        <QuickActions
          name={name}
          id={user.userId}
          currentUserId={currentUserId}
          que={que}
          recommend={recommend}
        />
      ) : null}
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
      bg={loading ? hoverBg : bg}
      color={color}
      px={['4px', 0]}
      pl={[0, '10px']}
      variant="ghost"
      h={track ? ['100px', '120px'] : '65px'}
      minW="100%"
      maxW="100%"
      borderRadius={5}
      _hover={isSmallScreen && !loading ? { bg } : { bg: hoverBg }}
      justifyContent="left"
    >
      {User}
      {Activity}
    </Button>
    /* {playback && <PlayerBarCSS playback={playback} />} */
  );
};
export default PrismaMiniPlayer;
