import { HStack, Text, Icon, Flex } from '@chakra-ui/react';

import { ArchiveTick, HeartAdd, Send2, Sound, Star1 } from 'iconsax-react';

import LikeIcon from '~/lib/icons/Like';
import type { Activity } from '~/lib/types/types';

import ActivityPlaylistInfo from './ActivityPlaylistInfo';
import ActivityUserInfo from './ActivityUserInfo';

const ActivityInfo = ({ activity }: { activity: Activity }) => {
  return (
    <Flex justify="space-between" align="center">
      <ActivityUserInfo user={activity.user} />

      {activity.liked && (
        <HStack align="center">
          <Text fontSize="10px" fontWeight="bolder">
            LIKED
          </Text>
          <LikeIcon aria-checked boxSize="20px" />
        </HStack>
      )}

      {activity.queue && (
        <HStack align="center">
          <Text fontSize="10px" fontWeight="bolder">
            SENT
          </Text>
          <Icon as={Send2} boxSize="20px" fill="white" />
          {activity.queue.owner.user && <ActivityUserInfo user={activity.queue.owner.user} />}
        </HStack>
      )}

      {activity.recommend && (
        <HStack align="center">
          <Text fontSize="10px" fontWeight="bolder">
            RECOMMENDED
          </Text>
          <Icon as={Star1} boxSize="20px" fill="white" />
        </HStack>
      )}

      {activity.playlist && (
        <HStack align="center">
          <Text fontSize="10px" fontWeight="bolder">
            ADDED TO
          </Text>
          <ActivityPlaylistInfo playlist={activity.playlist.playlist} />
        </HStack>
      )}

      {/* {activity.playback && (
        <HStack align="center">
          <Text fontSize="10px" fontWeight="bolder" textTransform="uppercase">
            LISTENED FOR{' '}
            {timeBetween({
              endDate: activity.playback?.endedAt,
              startDate: activity.playback?.startedAt,
            })}
          </Text>
          <Icon as={Sound} boxSize="20px" fill="white" />
        </HStack>
      )} */}
    </Flex>
  );
};

export default ActivityInfo;
