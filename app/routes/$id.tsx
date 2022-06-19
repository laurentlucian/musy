import { Avatar, Box, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import type { Profile as ProfileType, User } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import type { Session } from 'remix-auth-spotify';

import { getCurrentUser, getUser, spotifyStrategy } from '~/services/auth.server';
import { spotifyApi } from '~/services/spotify.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  const id = params.id;
  if (!id) return null;

  const user = await getUser(id);
  console.log('user', user);

  return user;
};

const Profile = () => {
  const { user } = useLoaderData<User & { user: ProfileType }>();

  return (
    <Stack textAlign="center">
      {user && (
        <HStack spacing={5}>
          <Avatar size="xl" src={user.image} />
          <Stack align="flex-start">
            <HStack>
              <Heading size="lg" fontWeight="bold">
                {user.name}
              </Heading>
            </HStack>
          </Stack>
        </HStack>
      )}
    </Stack>
  );
};

export default Profile;

export const CatchBoundary = () => {
  return (
    <Box>
      <Heading as="h2">I caught some condition</Heading>
    </Box>
  );
};

export const ErrorBoundary = ({ error }: any) => {
  return (
    <Box bg="red.400" px={4} py={2}>
      <Heading as="h3" size="lg" color="white">
        Something is really wrong!
      </Heading>
      <Box color="white" fontSize={22}>
        {error.message}
      </Box>
    </Box>
  );
};
