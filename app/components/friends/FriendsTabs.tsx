import { useEffect } from 'react';
import type { ReactNode } from 'react';

import {
  Badge,
  Divider,
  Stack,
  Tab,
  TabList,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';

import { motion, useCycle } from 'framer-motion';
import { Profile2User } from 'iconsax-react';
import { useTypedLoaderData } from 'remix-typedjson';

import type { loader } from '~/routes/friends';

const NotificationBadge = ({ count }: { count: number }) => {
  const [isFlashing, toggleFlash] = useCycle(false, true);

  useEffect(() => {
    toggleFlash();
  }, [toggleFlash]);

  return (
    <motion.div
      transition={{ duration: 1 }}
      style={{
        position: 'absolute',
        right: '-20px',
        top: '-20px',
        zIndex: 1,
      }}
      animate={isFlashing ? { opacity: [1, 0.7, 1], scale: [1, 1.2, 1] } : {}}
      onAnimationComplete={() => toggleFlash()}
    >
      <Badge bg="red" borderRadius="full">
        {count}
      </Badge>
    </motion.div>
  );
};

const PendingFriendsNotification = ({ pendingRequests }: { pendingRequests?: number }) => {
  return (
    <div style={{ position: 'relative' }}>
      <Text>requests</Text>
      {pendingRequests ? <NotificationBadge count={pendingRequests} /> : null}
    </div>
  );
};

const FriendsTabs = ({ children }: { children: ReactNode }) => {
  const { friends, pendingRequests } = useTypedLoaderData<typeof loader>();
  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue('#EEE6E2', '#050404');

  return (
    <Stack pt={{ base: '60px', xl: 0 }} pb="100px" spacing={3} w="100%" h="100%" px={['4px', 0]}>
      <Tabs align="start" colorScheme="green" variant="soft-rounded" size="sm">
        <TabList mb="5px">
          <Icon
            as={Profile2User}
            boxSize="18px"
            color="spotify.green"
            variant="Bold"
            mr="20px"
            alignSelf="center"
          />
          <Tab color={color} bg={bg} mr="20px">
            friends {friends.length ? friends.length : ''}
          </Tab>
          <Tab color={color} bg={bg}>
            <PendingFriendsNotification pendingRequests={pendingRequests.length} />
          </Tab>
        </TabList>
        <Divider bgColor="spotify.green" />
        <TabPanels>{children}</TabPanels>
      </Tabs>
    </Stack>
  );
};

export default FriendsTabs;
