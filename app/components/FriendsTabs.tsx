import type { ReactNode } from 'react';

import {
  Divider,
  Image,
  Stack,
  Tab,
  TabList,
  TabPanels,
  Tabs,
  useColorModeValue,
} from '@chakra-ui/react';

import { useTypedLoaderData } from 'remix-typedjson';

import type { loader } from '~/routes/friends';

const FriendsTabs = ({ children }: { children: ReactNode }) => {
  const { currentFriends, pendingFriends } = useTypedLoaderData<typeof loader>();
  const friendsTabImg = currentFriends ? <Image boxSize="15px" src="/users.svg" /> : null;
  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue('#EEE6E2', '#050404');

  return (
    <Stack pt={{ base: '60px', xl: 0 }} pb="100px" spacing={3} w="100%" h="100%" px={['4px', 0]}>
      <Tabs align="start" colorScheme="music" variant="soft-rounded">
        <TabList mb="5px">
          <Tab color={color} bg={bg}>
            {friendsTabImg} friends ~ {currentFriends.length}
          </Tab>
          <Tab color={color} bg={bg}>
            requests ~ {pendingFriends.length}
          </Tab>
        </TabList>
        <Divider bgColor="spotify.green" />
        <TabPanels>{children}</TabPanels>
      </Tabs>
    </Stack>
  );
};

export default FriendsTabs;
