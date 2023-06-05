import { HStack, Text, Icon, Flex } from '@chakra-ui/react';

import { Send2, Star1 } from 'iconsax-react';

import LikeIcon from '~/lib/icons/Like';
import type { Activity } from '~/lib/types/types';

import UserInfo from './ActivityUserInfo';

const ActivityInfo = ({ activity }: { activity: Activity }) => {
  return (
    <Flex justify="space-between" align="center">
      <UserInfo user={activity.user} />

      {activity.action === 'liked' && (
        <HStack align="center">
          <Text fontSize="10px" fontWeight="bolder">
            LIKED
          </Text>
          <LikeIcon aria-checked boxSize="20px" />
        </HStack>
      )}

      {activity.action === 'send' && (
        <HStack align="center">
          <Text fontSize="10px" fontWeight="bolder">
            SENT
          </Text>
          <Icon as={Send2} boxSize="20px" fill="white" />
          {activity.owner?.user && <UserInfo user={activity.owner.user} />}
        </HStack>
      )}

      {activity.action === 'recommend' && (
        <HStack align="center">
          <Text fontSize="10px" fontWeight="bolder">
            RECOMMENDED
          </Text>
          <Icon as={Star1} boxSize="20px" fill="white" />
        </HStack>
      )}
    </Flex>
  );
};

export default ActivityInfo;
