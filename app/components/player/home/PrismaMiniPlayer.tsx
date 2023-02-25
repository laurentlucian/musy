import { Link, useTransition } from '@remix-run/react';

import { Button, Flex, HStack, Image, Stack, Text, useColorModeValue, Box } from '@chakra-ui/react';

import type { Playback, Profile, Track } from '@prisma/client';
import { motion } from 'framer-motion';

import explicitImage from '~/assets/explicit-solid.svg';
import { useDrawerActions, useDrawerTrack } from '~/hooks/useDrawer';
import useIsMobile from '~/hooks/useIsMobile';
import type { User } from '~/lib/types/types';

import SpotifyLogo from '../../icons/SpotifyLogo';
import Waver from '../../icons/Waver';
import QuickActions from './QuickActions';

// import PlayerBarCSS from './PlayerBarCSS';
interface Friends extends User {
  playback:
    | (Playback & {
        track: Track & {
          liked: {
            user: Profile;
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
  layoutKey: string;
  user: Friends;
};

const PrismaMiniPlayer = ({ currentUserId, layoutKey, user }: PlayerProps) => {
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
  const que = user?.settings?.allowQueue;
  const recommend = user?.settings?.allowRecommend;

  // eslint-disable-next-line
  const dontRemoveThis = useDrawerTrack();

  const ProfilePic = (
    <Image
      boxSize="50px"
      borderRadius="100%"
      minH="50px"
      minW="50px"
      src={user.image}
      mr={[0, '10px']}
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
                  {user.bio.slice(0, isSmallScreen ? 14 : 50)}
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
          image={user.image}
          profileId={user.userId}
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
            <Text
              noOfLines={[1]}
              maxW={{ base: '110px', md: '300px', xl: 'unset' }}
              fontSize={{ base: 'smaller', md: 'sm' }}
            >
              {track.name}
            </Text>
            <Flex>
              {track.explicit ? (
                <Image mr={1} src={explicitImage} minW="16px" maxW="16px" />
              ) : (
                <Box minW="16px" maxW="16px" />
              )}
              <Text
                opacity={0.8}
                noOfLines={[1]}
                maxW={{ base: '110px', md: '300px', xl: 'unset' }}
                fontSize={{ base: 'smaller', md: 'xs' }}
              >
                {track.artist}
              </Text>
            </Flex>
            <Stack pt="10px" my="30px">
              <SpotifyLogo h="22px" w="70px" />
            </Stack>
          </Stack>
          <Image
            as={motion.img}
            layoutId={track.id + layoutKey}
            src={track.image}
            m={0}
            zIndex={99}
            boxSize={track ? ['100px', '120px'] : '60px'}
            minH={track ? ['100px', '120px'] : '60px'}
            maxH={track ? ['100px', '120px'] : '60px'}
            minW={track ? ['100px', '120px'] : '60px'}
            maxW={track ? ['100px', '120px'] : '60px'}
            onClick={(e) => {
              e.preventDefault();
              // e.stopPropagation();
              track && onOpen(track, user.userId, layoutKey);
            }}
          />
        </HStack>
      ) : (
        isSmallScreen &&
        loading && (
          <Box pl="30px">
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
      pl={['2px', '10px']}
      pr={0}
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
