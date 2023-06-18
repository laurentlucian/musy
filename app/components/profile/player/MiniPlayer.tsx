import { Link, useNavigation } from '@remix-run/react';

import { Button, Flex, HStack, Image, Stack, Text, useColorModeValue, Box } from '@chakra-ui/react';

import { motion } from 'framer-motion';

import { useFullscreen } from '~/components/fullscreen/Fullscreen';
import FullscreenTrack from '~/components/fullscreen/track/FullscreenTrack';
import FollowButton from '~/components/profile/profileHeader/FollowButton';
import useIsMobile from '~/hooks/useIsMobile';
import useCurrentUser from '~/hooks/useCurrentUser';
import explicitImage from '~/lib/assets/explicit-solid.svg';
import SpotifyLogo from '~/lib/icons/SpotifyLogo';
import Waver from '~/lib/icons/Waver';
import type { ProfileWithInfo, Track } from '~/lib/types/types';
import { shortenUsername } from '~/lib/utils';

import FavoriteButton from '../profileHeader/FavoriteButton';

type PlayerProps = {
  index: number;
  layoutKey: string;
  tracks: Track[];
  user: ProfileWithInfo;
};

const MiniPlayer = ({ layoutKey, user }: PlayerProps) => {
  const bg = useColorModeValue('musy.200', 'musy.900');
  const hoverBg = useColorModeValue('musy.50', '#5F5B59');
  const color = useColorModeValue('musy.900', 'musy.200');
  const navigation = useNavigation();
  const isSmallScreen = useIsMobile();
  const { onOpen } = useFullscreen();
  const currentUser = useCurrentUser();
  const name = shortenUsername(user.name);
  const loading = navigation.location?.pathname.includes(user.userId);

  const playback = user.playback;
  const track = playback?.track;

  const isOwnProfile = currentUser?.userId === user.userId;

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

  const Actions = (
    <HStack justify={track ? 'start' : 'end'} align="baseline" w="100%">
      <FavoriteButton id={user.userId} />
      {!isOwnProfile && <FollowButton id={user.userId} />}
    </HStack>
  );

  const User = (
    <Stack w="100%" justifySelf="left">
      <HStack width="100%">
        {ProfilePic}
        <Flex>
          <Stack>
            {!user.bio && loading ? (
              <Stack ml="8px">
                <Waver />
              </Stack>
            ) : (
              Username
            )}
            {user.bio && loading ? (
              <Waver />
            ) : user.bio ? (
              <Stack maxW={['40px', '100%']}>
                <Text opacity={0.8} fontSize={{ base: 'smaller', md: 'xs' }} h="20px">
                  {user.bio.slice(0, isSmallScreen ? 14 : 50)}
                </Text>
              </Stack>
            ) : null}
          </Stack>
        </Flex>
        {!track && Actions}
      </HStack>
      {track && Actions}
    </Stack>
  );
  const Activity = track && (
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
        zIndex={7}
        boxSize={track ? ['100px', '120px'] : '60px'}
        minH={track ? ['100px', '120px'] : '60px'}
        maxH={track ? ['100px', '120px'] : '60px'}
        minW={track ? ['100px', '120px'] : '60px'}
        maxW={track ? ['100px', '120px'] : '60px'}
        onClick={(e) => {
          e.preventDefault();
          track && onOpen(<FullscreenTrack track={track} originUserId={user.userId} />);
        }}
      />
    </HStack>
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
  );
};
export default MiniPlayer;
