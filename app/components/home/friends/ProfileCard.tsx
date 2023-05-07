import { Link, useTransition } from '@remix-run/react';

import { Button, HStack, Image, Stack, Text, useColorModeValue } from '@chakra-ui/react';

import useIsMobile from '~/hooks/useIsMobile';
import type { PendingCard } from '~/lib/types/types';
import { shortenUsername } from '~/lib/utils';

import Waver from '../../icons/Waver';

type PlayerProps = {
  user: PendingCard | null;
};

const ProfileCard = ({ user }: PlayerProps) => {
  const bg = useColorModeValue('music.200', 'music.900');
  const hoverBg = useColorModeValue('music.50', '#5F5B59');
  const color = useColorModeValue('music.900', 'music.200');
  const transition = useTransition();
  const isSmallScreen = useIsMobile();

  if (!user) return null;
  const name = shortenUsername(user.name);
  const loading = transition.location?.pathname.includes(user.userId);

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
            {isSmallScreen && !user.bio && loading ? (
              <Stack ml="8px">
                <Waver />
              </Stack>
            ) : (
              Username
            )}
            {isSmallScreen && user.bio && loading ? (
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
    </Stack>
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
export default ProfileCard;
