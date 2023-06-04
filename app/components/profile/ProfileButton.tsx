import { Link, useNavigation } from '@remix-run/react';

import { Box, Button, Flex, HStack, Image, Stack, Text, useColorModeValue } from '@chakra-ui/react';

import FollowButton from '~/components/profile/profileHeader/FollowButton';
import useIsFollowing from '~/hooks/useIsFollowing';
import useIsMobile from '~/hooks/useIsMobile';
import Waver from '~/lib/icons/Waver';
import type { ProfileWithInfo } from '~/lib/types/types';
import { shortenUsername } from '~/lib/utils';

import SendSongButton from './profileHeader/SendSongButton';

const ProfileButton = ({ user }: { user: ProfileWithInfo }) => {
  const bg = useColorModeValue('musy.200', 'musy.900');
  const hoverBg = useColorModeValue('musy.50', '#5F5B59');
  const color = useColorModeValue('musy.900', 'musy.200');
  const navigation = useNavigation();
  const isSmallScreen = useIsMobile();
  const name = shortenUsername(user.name);
  const loading = navigation.location?.pathname.includes(user.userId);
  const isFollowing = useIsFollowing(user.userId);

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
    <Box maxW="130px">
      {isFollowing ? <SendSongButton id={user.userId} /> : <FollowButton id={user.userId} />}
    </Box>
  );

  const User = (
    <Flex justify="space-between" w="100%" align="center" pr="5px">
      <HStack>
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
      </HStack>
      {Actions}
    </Flex>
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
      h="65px"
      minW="100%"
      maxW="100%"
      borderRadius={5}
      _hover={isSmallScreen && !loading ? { bg } : { bg: hoverBg }}
      justifyContent="left"
    >
      {User}
    </Button>
  );
};

export default ProfileButton;
