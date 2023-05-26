import { useState } from 'react';

import { Avatar, AvatarGroup, HStack, Icon, Stack, Text } from '@chakra-ui/react';

import type { Profile } from '@prisma/client';
import { DirectInbox } from 'iconsax-react';

import Tooltip from '~/components/Tooltip';
import { shortenUsername } from '~/lib/utils';

const QueuedBy = (props: {
  queued: {
    owner: { user: Profile | null };
  }[];
}) => {
  const [isLabelOpen, setIsLabelOpen] = useState(false);
  return (
    <HStack
      onMouseEnter={() => setIsLabelOpen(true)}
      onMouseLeave={() => setIsLabelOpen(false)}
      onClick={() => setIsLabelOpen(!isLabelOpen)}
    >
      <Icon as={DirectInbox} />
      <Tooltip
        isOpen={isLabelOpen}
        label={
          <Stack py="2px">
            {props.queued.map(({ owner: { user } }, index) => {
              const name = shortenUsername(user?.name);
              return (
                <HStack key={index}>
                  <Avatar
                    minW="20px"
                    maxW="20px"
                    minH="20px"
                    maxH="20px"
                    name={user?.name}
                    src={user?.image}
                  />
                  <Text>{name}</Text>
                </HStack>
              );
            })}
          </Stack>
        }
      >
        <AvatarGroup size="xs" max={5} spacing="-9px">
          {props.queued.slice(0, 5).map(({ owner: { user } }, index) => (
            <Avatar
              minW="20px"
              maxW="20px"
              minH="20px"
              maxH="20px"
              key={index}
              name={user?.name}
              src={user?.image}
            />
          ))}
        </AvatarGroup>
      </Tooltip>
    </HStack>
  );
};

export default QueuedBy;
