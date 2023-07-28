import { Link } from '@remix-run/react';

import { HStack, Stack, Text } from '@chakra-ui/react';

import TileUserImage from '~/components/tile/user/TileUserImage';
import type { ProfileWithInfo } from '~/lib/types/types';

const ActivityUserInfo = ({ user }: { user: ProfileWithInfo }) => {
  return (
    <HStack flexShrink={0}>
      <TileUserImage user={user} size="35px" />
      <Stack as={Link} to={`/${user.userId}`} spacing={0} data-group>
        <Text fontWeight="bold" fontSize="xs" _groupHover={{ textDecoration: 'underline' }}>
          {user.name}
        </Text>
        <Text fontSize="9px">{user.bio}</Text>
      </Stack>
    </HStack>
  );
};

export default ActivityUserInfo;
