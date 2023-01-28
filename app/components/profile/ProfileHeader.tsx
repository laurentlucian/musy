import { Heading, HStack, Stack, Text, Image, Textarea, Flex, VStack } from '@chakra-ui/react';
import { useTypedRouteLoaderData } from 'remix-typedjson';
import MoodButton from '~/components/profile/MoodButton';
import { Form, useSubmit } from '@remix-run/react';
import Following from '~/components/Following';
import Tooltip from '~/components/Tooltip';
import type { loader } from '~/routes/$id';
import { timeSince } from '~/lib/utils';
import SpotifyLogo from '../icons/SpotifyLogo';

const ProfileHeader = () => {
  const data = useTypedRouteLoaderData<typeof loader>('routes/$id');
  const submit = useSubmit();
  if (!data) return null;

  const { user, currentUser, following, listened } = data;

  return (
    <HStack>
      <Tooltip label="<3" placement="top">
        <Image borderRadius="100%" boxSize={[150, 150, 200]} src={user.image} />
      </Tooltip>
      <Stack spacing={1} flex={1} maxW="calc(100% - 100px)">
        <Heading
          size={user.name.length > 10 ? 'lg' : user.name.length > 16 ? 'md' : 'xl'}
          fontWeight="bold"
          textAlign="left"
        >
          {user.name}
        </Heading>

        {user.id === currentUser?.id ? (
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
            />
          </Form>
        ) : (
          <Text
            fontSize="14px"
            noOfLines={3}
            whiteSpace="normal"
            zIndex={-2}
            wordBreak="break-word"
          >
            {user.bio}
          </Text>
        )}
        <HStack spacing={5}>
          <Flex wrap="wrap" align="baseline">
            <Text fontSize="14px" mr="8px">
              {listened} listened
            </Text>
            <Text as="span" fontSize="13px" opacity={0.5}>
              in 24h
            </Text>
          </Flex>
          <Flex wrap="wrap" align="baseline">
            <Text fontSize="14px" mr="8px">
              {user.ai?.mood}
            </Text>
            <Text as="span" fontSize="13px" opacity={0.5}>
              {timeSince(user.ai?.updatedAt ?? null)}
            </Text>
          </Flex>
        </HStack>
        <Flex pb="5px">
          {currentUser && <MoodButton />}
          {currentUser && following !== null && <Following following={following} />}
          <SpotifyLogo h="22px" w="70px" alignSelf="center" px="10px" />
        </Flex>
      </Stack>
    </HStack>
  );
};

export default ProfileHeader;
