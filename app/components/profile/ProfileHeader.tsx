import { Form, useSubmit } from '@remix-run/react';

import { Heading, HStack, Stack, Text, Image, Textarea, Flex, VStack } from '@chakra-ui/react';

import { useTypedRouteLoaderData } from 'remix-typedjson';

import Following from '~/components/profile/Following';
import MoodButton from '~/components/profile/MoodButton';
import Tooltip from '~/components/Tooltip';
import type { loader } from '~/routes/$id';

// import SpotifyLogo from '../icons/SpotifyLogo';
import useIsMobile from '~/hooks/useIsMobile';
import Search from './Search';

const ProfileHeader = () => {
  const data = useTypedRouteLoaderData<typeof loader>('routes/$id');
  const submit = useSubmit();
  const isSmallScreen = useIsMobile();
  if (!data) return null;

  const { currentUser, following, listened, user } = data;
  const isOwnProfile = currentUser?.userId === user.userId;
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
    <Heading
      size={user.name.length > 10 ? 'lg' : user.name.length > 16 ? 'md' : 'xl'}
      fontWeight="bold"
      textAlign="left"
    >
      {user.name}
    </Heading>
  );
  const Bio =
    user.id === currentUser?.id ? (
      <Stack w="100%" minW="100%" maxW="100%" pt="20px">
        <Form method="post" replace>
          <Textarea
            name="bio"
            size="md"
            variant="flushed"
            defaultValue={user.bio ?? ''}
            placeholder="write something :)"
            onBlur={(e) => submit(e.currentTarget.form)}
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
        </Form>
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
  const SubHeader = (
    <HStack spacing={5} position="relative">
      <Flex wrap="wrap" align="baseline">
        {Mood}
      </Flex>
      <Tooltip label="hours listened" placement="bottom-end" hasArrow>
        <Flex wrap="wrap" align="baseline">
          <Text fontSize="13px" mr="8px">
            {listened}
          </Text>
          <Text as="span" fontSize="12px" opacity={0.5}>
            /&nbsp; 24h
          </Text>
        </Flex>
      </Tooltip>
    </HStack>
  );

  const FollowButton =
    currentUser && following !== null && !isSmallScreen ? (
      <Following following={following} />
    ) : null;

  return (
    <VStack mb="40px" alignItems="baseline" ml={['15px', '20px']} w="100%">
      <HStack>
        {ProfilePic}
        <VStack align="left" pos="relative" top="20px" left="10px">
          <HStack>
            {Username}
            {FollowButton}
          </HStack>
          <VStack justify="flex-end" align="inherit" pr={['10px', 0]}>
            {SubHeader}
          </VStack>
        </VStack>
      </HStack>
      {Bio}
      {!isOwnProfile && (
        <Stack w="97%" pos="relative" top="30px">
          <Search />
        </Stack>
      )}
    </VStack>
  );
};

export default ProfileHeader;
{
  /* <SpotifyLogo h="22px" w="70px" alignSelf="center" px="10px" /> */
}
