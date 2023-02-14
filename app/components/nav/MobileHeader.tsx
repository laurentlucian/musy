import { useLocation, useTransition } from '@remix-run/react';
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

import useIsMobile from '~/hooks/useIsMobile';
import useParentData from '~/hooks/useParentData';

// import UserSearch from './UserSearch';

type ParentData = {
  currentUserId: string;
  timestamp: number;
  users: User[];
};

const MobileHeader = ({ authorized }: { authorized: boolean }) => {
  const transition = useTransition();
  const { pathname } = useLocation();
  const isSmallScreen = useIsMobile();
  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue('#EEE6E2', '#050404');

  const users = useParentData('/friends') as ParentData | undefined;
  const friendCount = (users?.users?.length ?? 1) - 1;
  const Home = (
    <HStack w="100%" bg={bg} h="100%" pl="5px">
      <Image src="/musylogo1.svg" boxSize="35px" mb="10px" />
      <Heading size="sm">musy</Heading>
    </HStack>
  );

  const Friends = (
    <Stack w="100%" bg={bg} h="100%" pt="5px" pl="10px">
      <HStack>
        <Icon as={Users} color={color} boxSize="25px" alignSelf="start" />
        <Heading fontSize="sm" pt="9px" pl="6px">
          friends
        </Heading>
        <Text fontSize="xs" fontWeight="300" pt="10px">
          ~ {friendCount}
        </Text>
      </HStack>
      <Divider bgColor={color} />
    </Stack>
  );

  const Header = pathname.includes('home') ? Home : pathname.includes('friends') ? Friends : null;

  return (
    <Flex w="100%" as="header" pb={2} justify="space-between" pos="sticky" top={0} zIndex={1}>
      {Header}
    </Flex>
  );
};

export default MobileHeader;
