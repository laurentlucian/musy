import { HStack, Stack, Text, Icon, AvatarGroup, Avatar } from '@chakra-ui/react';
import { Play } from 'iconsax-react';
import type { Profile } from '@prisma/client';
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
              played.reduce((acc: Record<string, { user: Profile; count: number }>, curr) => {
                if (!curr.user) return acc;
                const userId = curr.user.userId;
                if (!acc[userId]) {
                  acc[userId] = { user: curr.user, count: 1 };
                } else {
                  acc[userId].count += 1;
                }
                return acc;
              }, {}),
            )
              .sort((a, b) => b.count - a.count)
              .map(({ user, count }, index) => {
                const [first, second = ''] = user.name.split(/[\s.]+/);
                const name =
                  second.length > 4 || first.length >= 6 ? first : [first, second].join(' ');
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
