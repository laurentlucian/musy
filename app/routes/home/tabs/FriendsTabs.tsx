import { Stack, TabPanel } from '@chakra-ui/react';

import PrismaMiniPlayer from '~/components/player/home/PrismaMiniPlayer';

type Props = {
  currentUser: any;
  sortedFriends: any;
  tracks: any;
};
export const FriendsTabs = ({ currentUser, sortedFriends, tracks }: Props) => {
  return (
    <TabPanel
      as={Stack}
      pb="50px"
      pt={{ base: 4, md: 0 }}
      spacing={3}
      w="100%"
      h="100%"
      px={['4px', 0]}
    >
      {sortedFriends.map((user, index) => {
        return (
          <PrismaMiniPlayer
            key={user.userId}
            layoutKey={'MiniPlayerF' + index}
            user={user}
            currentUserId={currentUser?.userId}
            tracks={tracks}
            friendsTracks={[]}
            index={index}
          />
        );
      })}
    </TabPanel>
  );
};
