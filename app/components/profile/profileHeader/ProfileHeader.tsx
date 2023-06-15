import { useSearchParams } from '@remix-run/react';

import { Heading, HStack, Stack, Text, Image, Flex, SimpleGrid } from '@chakra-ui/react';

import { CodeCircle } from 'iconsax-react';
import { useTypedRouteLoaderData } from 'remix-typedjson';

import MoodButton from '~/components/profile/profileHeader/MoodButton';
import Tooltip from '~/components/Tooltip';
import useSessionUser from '~/hooks/useSessionUser';
import type { loader } from '~/routes/$id';

import PrivateBadge from '../badges/PrivateBadge';
import AddToQueue from './AddToQueue';
import Bio from './Bio';
import FollowButton from './FollowButton';

const ProfileHeader = () => {
  const data = useTypedRouteLoaderData<typeof loader>('routes/$id');
  const [params, setParams] = useSearchParams();
  const currentUser = useSessionUser();

  if (!data) return null;

  const { listened, user } = data;

  const isOwnProfile = currentUser?.userId === user.userId;

  const ProfilePic = (
    <Tooltip label="<3" placement="top" hasArrow>
      <Image
        borderRadius="full"
        minW={[100, 150, 200]}
        maxW={[100, 150, 200]}
        minH={[100, 150, 200]}
        maxH={[100, 150, 200]}
        src={user.image}
        mr={[0, '10px']}
      />
    </Tooltip>
  );

  const Username = (
    <HStack>
      <HStack spacing={3}>
        <Heading size={['md', 'lg']} fontWeight="bold" textAlign="left">
          {user.name}
        </Heading>
      </HStack>
      <PrivateBadge />
      {user.settings?.founder === true && (
        <Tooltip label="Dev" placement="top" hasArrow>
          <CodeCircle size="32" variant="Bulk" />
        </Tooltip>
      )}
    </HStack>
  );

  const timeframe = params.get('listened') === 'week' ? '7d' : '24h';
  const SubHeader = (
    <>
      <Tooltip label="hours listened" placement="bottom-end" hasArrow>
        <Flex
          align="baseline"
          pt="1px"
          cursor="pointer"
          onClick={() => {
            if (params.get('listened') === 'week') {
              params.delete('listened');
              setParams(params);
            } else {
              setParams({ listened: 'week' });
            }
          }}
        >
          <Text fontSize={['10px', '13px']} mr="5px">
            {listened}
          </Text>
          <Text as="span" fontSize={['9px', '10px']} opacity={0.5}>
            /&nbsp; {timeframe}
          </Text>
        </Flex>
      </Tooltip>
      <MoodButton mood={user.ai?.mood} since={user.ai?.updatedAt} />
    </>
  );

  const Buttons = (
    <SimpleGrid columns={2} gap={2} maxW={['100%', 'fit-content']}>
      <FollowButton />
      <AddToQueue />
    </SimpleGrid>
  );

  return (
    <HStack spacing={3} align="unset">
      <Stack>
        {ProfilePic}
        <Flex direction="column" align="center">
          {SubHeader}
        </Flex>
      </Stack>
      <Stack flexGrow={1} spacing={[2, 0]} justify={isOwnProfile ? 'flex-start' : 'space-between'}>
        <Stack spacing={3}>
          {Username}
          {!isOwnProfile && Buttons}
        </Stack>
        <Bio bio={user.bio} isOwnProfile={isOwnProfile} />
      </Stack>
    </HStack>
  );
};

export default ProfileHeader;
