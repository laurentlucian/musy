import { Link } from '@remix-run/react';

import { HStack, Image, Stack, Text } from '@chakra-ui/react';

import type { Profile } from '@prisma/client';

const ActivityUserInfo = ({ user }: { user: Profile }) => {
  return (
    <Link to={`/${user.userId}`}>
      <HStack data-group>
        <Image
          minW="35px"
          maxW="35px"
          minH="35px"
          maxH="35px"
          borderRadius="100%"
          src={user.image}
        />
        <Stack spacing={0}>
          <Text _groupHover={{ textDecoration: 'underline' }} fontWeight="bold" fontSize="xs">
            {user.name}
          </Text>
          <Text fontSize="9px">{user.bio}</Text>
        </Stack>
      </HStack>
    </Link>
  );
};

export default ActivityUserInfo;
