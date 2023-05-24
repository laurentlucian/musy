import { Heading, HStack, Text } from '@chakra-ui/react';

import useSessionUser from '~/hooks/useSessionUser';

const FriendsHeader = () => {
  const currentUser = useSessionUser();
  const friendCount = currentUser?.friendsList.length;

  return (
    <HStack>
      <Heading fontSize="sm" pt="9px" pl="25px">
        friends
      </Heading>
      <Text fontSize="xs" fontWeight="300" pt="10px">
        ~ {friendCount}
      </Text>
    </HStack>
  );
};

export default FriendsHeader;
