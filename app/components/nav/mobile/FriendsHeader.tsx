import { Divider, Heading, HStack, Stack, Text, useColorModeValue } from '@chakra-ui/react';

import useSessionUser from '~/hooks/useSessionUser';

import UserMenu from '../UserMenu';

const FriendsHeader = () => {
  const bg = useColorModeValue('#EEE6E2', '#050404');
  const color = useColorModeValue('#161616', '#EEE6E2');
  // const users = useParentData('/friends') as User;
  const user = useSessionUser();
  const friendCount = user?.friends?.length;

  return (
    <Stack w="100%" h="100%" bg={bg} pt="5px">
      <HStack w="100%" justifyContent="center">
        <HStack>
          <Heading fontSize="sm" pt="9px" pl="25px">
            friends
          </Heading>
          <Text fontSize="xs" fontWeight="300" pt="10px">
            ~ {friendCount}
          </Text>
        </HStack>
        <UserMenu />
      </HStack>
      <Divider bgColor={color} />
    </Stack>
  );
};

export default FriendsHeader;
