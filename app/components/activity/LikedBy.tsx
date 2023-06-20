import { useState } from 'react';
import { Heart } from 'react-feather';

import { Avatar, AvatarGroup, HStack, Icon, Stack, Text } from '@chakra-ui/react';

import type { Profile } from '@prisma/client';

import Tooltip from '~/components/Tooltip';
import { shortenUsername } from '~/lib/utils';

const LikedBy = (props: {
  liked?: {
    user: Profile | null;
  }[];
  slice?: number;
}) => {
  const [isLabelOpen, setIsLabelOpen] = useState(false);
  const slice = props.slice || 5;

  if (!props.liked?.length) return null;
  return (
    <HStack
      onMouseEnter={() => setIsLabelOpen(true)}
      onMouseLeave={() => setIsLabelOpen(false)}
      onClick={() => setIsLabelOpen(!isLabelOpen)}
      spacing={1}
    >
      <Icon as={Heart} />
      <Tooltip
        isOpen={isLabelOpen}
        label={
          <Stack py="2px">
            {props.liked.map(({ user }, index) => {
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
          {props.liked.slice(0, slice).map(({ user }) => (
            <Avatar
              minW="20px"
              maxW="20px"
              minH="20px"
              maxH="20px"
              key={user?.userId}
              name={user?.name}
              src={user?.image}
            />
          ))}
        </AvatarGroup>
      </Tooltip>
    </HStack>
  );
};

export default LikedBy;
