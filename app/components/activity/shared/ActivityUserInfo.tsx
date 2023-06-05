import { Link } from '@remix-run/react';

import { HStack, Stack, Text } from '@chakra-ui/react';

import TileUserImage from '~/components/tile/user/TileUserImage';
import type { ProfileWithInfo } from '~/lib/types/types';

const ActivityUserInfo = ({ user }: { user: ProfileWithInfo }) => {
  return (
    <HStack>
      <TileUserImage user={user} size="35px" />
      <Link to={`/${user.userId}`}>
        <Stack spacing={0} data-group>
          <Text fontWeight="bold" fontSize="xs" _groupHover={{ textDecoration: 'underline' }}>
            {user.name}
          </Text>
          <Text fontSize="9px">{user.bio}</Text>
        </Stack>
      </Link>
    </HStack>
  );
};

export default ActivityUserInfo;
