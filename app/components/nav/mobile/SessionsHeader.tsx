import { Divider, Heading, HStack, Stack, useColorModeValue } from '@chakra-ui/react';

import UserMenu from '../UserMenu';

const SessionsHeader = () => {
  const bg = useColorModeValue('#EEE6E2', '#050404');
  const color = useColorModeValue('#161616', '#EEE6E2');

  return (
    <Stack w="100%" h="100%" bg={bg} pt="5px">
      <HStack w="100%" justifyContent="center">
        <HStack>
          <Heading fontSize="sm" pt="9px">
            Sessions
          </Heading>
        </HStack>
        <UserMenu />
      </HStack>
      <Divider bgColor={color} />
    </Stack>
  );
};

export default SessionsHeader;
