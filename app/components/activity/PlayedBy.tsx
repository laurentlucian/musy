import { useState } from 'react';

import { HStack, Stack, Text, Icon, AvatarGroup, Avatar } from '@chakra-ui/react';

import type { Profile } from '@prisma/client';
import { Play } from 'iconsax-react';

import Tooltip from '~/components/Tooltip';
import { shortenUsername } from '~/lib/utils';

const PlayedBy = (props: {
  played?: {
    user: Profile | null;
  }[];
  slice?: number;
}) => {
  const [isLabelOpen, setIsLabelOpen] = useState(false);
  const slice = props.slice || 5;

  if (!props.played?.length) return null;
  return (
    <HStack
      onMouseEnter={() => setIsLabelOpen(true)}
      onMouseLeave={() => setIsLabelOpen(false)}
      onClick={() => setIsLabelOpen(!isLabelOpen)}
      spacing={1}
    >
      <Icon as={Play} />
      <Tooltip
        isOpen={isLabelOpen}
        label={
          <Stack py="2px">
            {Object.values(
              props.played.reduce((acc: Record<string, { count: number; user: Profile }>, curr) => {
                if (!curr.user) return acc;
                const userId = curr.user.userId;
                if (!acc[userId]) {
                  acc[userId] = { count: 1, user: curr.user };
                } else {
                  acc[userId].count += 1;
                }
                return acc;
              }, {}),
            )
              .sort((a, b) => b.count - a.count)
              .map(({ count, user }, index) => {
                const name = shortenUsername(user.name);
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
                    {count > 1 && <Text>{count}x</Text>}
                  </HStack>
                );
              })}
          </Stack>
        }
      >
        <AvatarGroup size="xs">
          {props.played.slice(0, slice).map(({ user }, index) => (
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

export default PlayedBy;
