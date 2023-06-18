import { Link } from '@remix-run/react';
import { forwardRef } from 'react';

import { Avatar, Flex, Stack, Text } from '@chakra-ui/react';
import type { ChakraProps } from '@chakra-ui/react';

import type { Profile } from '@prisma/client';

import Tooltip from '../Tooltip';

type UserTileProps = {
  profile: Profile;
} & ChakraProps;

const UserTile = forwardRef<HTMLDivElement, UserTileProps>(({ profile, ...props }, ref) => {
  const { bio, image, name, userId } = profile;

  return (
    <Stack ref={ref} direction="row" {...props}>
      <Flex direction="column">
        <Tooltip label={name} placement="top-start">
          <Avatar
            as={Link}
            to={`/${userId}`}
            boxSize="40px"
            minW="40px"
            minH="40px"
            objectFit="cover"
            src={image}
            cursor="pointer"
          />
        </Tooltip>
      </Flex>
      <Flex justify="space-between">
        <Stack as={Link} to={`/${userId}`} spacing={0} cursor="pointer">
          <Text fontSize="13px" noOfLines={3} whiteSpace="normal" wordBreak="break-all">
            {name}
          </Text>
          <Stack>
            <Stack direction="row">
              <Text fontSize="11px" opacity={0.8} noOfLines={1}>
                {bio}
              </Text>
            </Stack>
          </Stack>
        </Stack>
      </Flex>
    </Stack>
  );
});

UserTile.displayName = 'UserTile';

export default UserTile;
