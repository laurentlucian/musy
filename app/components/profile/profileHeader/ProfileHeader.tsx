import { useParams, useSearchParams } from '@remix-run/react';

import { Heading, HStack, Stack, Text, Image, Textarea, Flex, VStack } from '@chakra-ui/react';

import { CodeCircle } from 'iconsax-react';
import { useTypedFetcher, useTypedRouteLoaderData } from 'remix-typedjson';

import AddFriendsButton from '~/components/profile/profileHeader/AddFriendsButton';
import MoodButton from '~/components/profile/profileHeader/MoodButton';
import Tooltip from '~/components/Tooltip';
import useIsMobile from '~/hooks/useIsMobile';
import useSessionUser from '~/hooks/useSessionUser';
import type { loader } from '~/routes/$id';
import type { action as bioAction } from '~/routes/api/user/profile/bio';

import PrivateBadge from '../badges/PrivateBadge';
import FavoriteButton from './FavoriteButton';
import { BlockUser } from './profileActions/BlockUser';
import ProfileActions from './profileActions/ProfileActions';
import Search from './Search';

const ProfileHeader = () => {
  const data = useTypedRouteLoaderData<typeof loader>('routes/$id');
  const [params, setParams] = useSearchParams();
  const isSmallScreen = useIsMobile();
  const currentUser = useSessionUser();
  const { id } = useParams();
  const fetcher = useTypedFetcher<typeof bioAction>();

  if (!data) return null;

  const { listened, user } = data;

  const isOwnProfile = currentUser?.userId === user.userId;

  const isBlocked = currentUser?.block.find((block) => block.blockedId === user.userId);
  const isMuted = currentUser?.mute.find((mute) => mute.mutedId === user.userId);

  const updateBio = (bio: string) => {
    fetcher.submit(
      { bio, userId: id ?? ':)' },
      { action: '/api/user/profile/bio', method: 'post', replace: true },
    );
  };

  const ProfilePic = (
    <Tooltip label="<3" placement="top" hasArrow>
      <Image
        borderRadius="full"
        minW={[150, 150, 200]}
        maxW={[150, 150, 200]}
        minH={[150, 150, 200]}
        maxH={[150, 150, 200]}
        src={user.image}
        mr={[0, '10px']}
      />
    </Tooltip>
  );

  const Username = (
    <HStack>
      <Heading
        size={user.name.length > 10 ? 'lg' : user.name.length > 16 ? 'md' : 'xl'}
        fontWeight="bold"
        textAlign="left"
      >
        {user.name}
      </Heading>
      <PrivateBadge />
      {user.settings?.founder === true && (
        <Tooltip label="Dev" placement="top" hasArrow>
          <CodeCircle size="32" variant="Bulk" />
        </Tooltip>
      )}
    </HStack>
  );

  const Bio =
    user.id === currentUser?.id ? (
      <Stack w="100%" minW="100%" maxW="100%" pt="20px">
        <Textarea
          name="bio"
          size="md"
          variant="flushed"
          defaultValue={user.bio ?? ''}
          placeholder="write something :)"
          onBlur={(e) => updateBio(e.currentTarget.value)}
          resize="none"
          maxLength={75}
          rows={2}
          py={0}
          focusBorderColor="spotify.green"
          w={isSmallScreen ? '100%' : '50%'}
          spellCheck={false}
          h="100%"
          minH="20px"
          overflow="hidden"
        />
      </Stack>
    ) : (
      <Text
        fontSize="14px"
        noOfLines={3}
        whiteSpace="normal"
        wordBreak="break-word"
        w="100%"
        spellCheck={false}
        h="100%"
        minH="20px"
        pt="20px"
      >
        {user.bio}
      </Text>
    );
  const Mood = currentUser ? <MoodButton mood={user.ai?.mood} since={user.ai?.updatedAt} /> : null;

  const timeframe = params.get('listened') === 'week' ? '7d' : '24h';
  const SubHeader = (
    <HStack spacing={[3, 5]} position="relative">
      {Mood}
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
          <Text fontSize="13px" mr="8px">
            {listened}
          </Text>
          <Text as="span" fontSize="10px" opacity={0.5}>
            /&nbsp; {timeframe}
          </Text>
        </Flex>
      </Tooltip>
    </HStack>
  );

  const MenuBttn = !isOwnProfile ? (
    <ProfileActions
      block={!!isBlocked}
      blockId={String(isBlocked?.blockedId)}
      mute={!!isMuted}
      muteId={String(isMuted?.id)}
    />
  ) : null;

  return (
    <VStack mb="40px" alignItems="baseline" w="100%">
      <HStack>
        {ProfilePic}
        <VStack align="left" pos="relative" top="20px" left="10px">
          <HStack>{Username}</HStack>
          <VStack justify="flex-end" align="inherit" pr={['10px', 0]}>
            <HStack>
              {isBlocked ? (
                <BlockUser header block={true} blockId={String(isBlocked.blockedId)} />
              ) : (
                <>
                  <FavoriteButton />
                  {!isOwnProfile && <AddFriendsButton />}
                </>
              )}
              {MenuBttn}
            </HStack>
            {SubHeader}
          </VStack>
        </VStack>
      </HStack>
      {Bio}
      {!isOwnProfile && !isBlocked && (
        <Stack w="97%" pos="relative" top="30px" pb="20px">
          <Search />
        </Stack>
      )}
    </VStack>
  );
};

export default ProfileHeader;
