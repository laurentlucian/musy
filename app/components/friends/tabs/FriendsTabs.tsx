import { Divider, Stack, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';

import type { Playback, Profile, Settings, Track } from '@prisma/client';

import PrismaMiniPlayer from '~/components/player/home/PrismaMiniPlayer';
import usePending from '~/hooks/usePending';
import useSessionUser from '~/hooks/useSessionUser';

import ProfileCard from '../ProfileCard';

type Props = {
  sortedFriends: (Profile & {
    playback:
      | (Playback & {
          track: Track & {
            liked: {
              user: Profile;
            }[];
            recent: {
              user: Profile;
            }[];
          };
        })
      | null;
    settings: Settings | null;
  })[];
  tracks: Track[];
};
export const FriendsTabs = ({ sortedFriends, tracks }: Props) => {
  const currentUser = useSessionUser();
  const pendingFriends = usePending();
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
      <Stack spacing={3} w="100%" h="100%">
        <Tabs align="start" colorScheme="green" variant="soft-rounded" size="sm">
          <TabList mb="5px">
            <Tab mr="20px">friends {sortedFriends.length}</Tab>
            <Tab>requests {pendingFriends.length ? pendingFriends.length : ''}</Tab>
          </TabList>
          <Divider bgColor="spotify.green" />
          <TabPanels>
            <TabPanel>
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
            <TabPanel>
              {pendingFriends.map(({ user: { user } }) => {
                return <ProfileCard key={user?.userId} user={user} />;
              })}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Stack>
    </TabPanel>
  );
};
