import { useLocation } from '@remix-run/react';
import { Users } from 'react-feather';

import {
  Icon,
  Divider,
  Flex,
  Heading,
  HStack,
  Image,
  Text,
  useColorModeValue,
  Stack,
} from '@chakra-ui/react';

import type { User } from '@prisma/client';

import useParentData from '~/hooks/useParentData';
import useSessionUser from '~/hooks/useSessionUser';

import UserMenu from './UserMenu';

// import UserSearch from './UserSearch';

type ParentData = {
  currentUserId: string;
  timestamp: number;
  users: User[];
};

const MobileHeader = ({ authorized }: { authorized: boolean }) => {
  const { pathname } = useLocation();
  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue('#EEE6E2', '#050404');

  const currentUser = useSessionUser();
  const users = useParentData('/friends') as ParentData | undefined;
  const friendCount = (users?.users?.length ?? 1) - 1;
  const Home = (
    <HStack w="100%" bg={bg} h="100%" pl="5px" justifyContent="space-between">
      <HStack>
        <Image src="/musylogo1.svg" boxSize="35px" mb="10px" />
        <Heading size="sm">musy</Heading>
      </HStack>
      <UserMenu isSmallScreen={true} pathname={pathname} />
    </HStack>
  );

  const Friends = (
    <Stack w="100%" bg={bg} h="100%" pt="5px" pl="10px">
      <HStack w="100%" justifyContent="space-between">
        <HStack>
          <Icon as={Users} color={color} boxSize="25px" alignSelf="start" />
          <Heading fontSize="sm" pt="9px" pl="6px">
            friends
          </Heading>
          <Text fontSize="xs" fontWeight="300" pt="10px">
            ~ {friendCount}
          </Text>
        </HStack>
        <UserMenu isSmallScreen={true} pathname={pathname}/>
      </HStack>
      <Divider bgColor={color} />
    </Stack>
  );

  const Header = pathname.includes('home') ? (
    Home
  ) : pathname.includes('friends') ? (
    Friends
  ) : pathname.includes(`${currentUser?.userId}`) ? (
    <UserMenu isSmallScreen={true} pathname={pathname} />
  ) : null;

  return (
    <Flex
      w="100%"
      as="header"
      pb={2}
      justify={pathname.includes(`${currentUser?.userId}`) ? 'end' : 'space-between'}
      pos="sticky"
      top={0}
      zIndex={1}
    >
      {Header}
    </Flex>
  );
};

export default MobileHeader;
