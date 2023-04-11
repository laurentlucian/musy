import { HStack, Stack, Text, Icon, AvatarGroup, Avatar } from '@chakra-ui/react';

import type { Profile } from '@prisma/client';
import { Play } from 'iconsax-react';

import { shortenUsername } from '~/lib/utils';

import Tooltip from '../Tooltip';

const PlayedBy = ({
  played,
}: {
  played: {
    user: Profile | null;
  }[];
}) => {
  return (
    <HStack>
      <Icon as={Play} />
      <Tooltip
        label={
          <Stack py="2px">
            {Object.values(
              played.reduce((acc: Record<string, { count: number; user: Profile }>, curr) => {
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
          {played.slice(0, 5).map(({ user }, index) => (
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
