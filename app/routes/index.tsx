import { Avatar, Box, Button, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import type { Profile } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import { Form, Link, useLoaderData, useTransition } from '@remix-run/react';

import { getAllUsers, spotifyStrategy } from '~/services/auth.server';

const Index = () => {
  const { user, users } = useLoaderData<{
    user: SpotifyApi.CurrentUsersProfileResponse;
    users: Profile[];
  }>();
  const transition = useTransition();

  return (
    <Stack>
      {users.map((user) => {
        return (
          <Button
            as={Link}
            to={`/${user.userId}`}
            isLoading={transition.state === 'loading' && transition.location.pathname.includes(user.userId)}
            key={user.userId}
            variant="ghost"
            h="70px"
          >
            <HStack spacing={3} w="100%">
              <Avatar src={user.image} size="md" />
              <Text fontWeight="bold">{user.name}</Text>
            </HStack>
          </Button>
        );
      })}
      {!user && (
        <Form action={'/auth/spotify'} method="post">
          <Button isLoading={transition.state === 'submitting'} type="submit">
            Join
          </Button>
        </Form>
      )}
    </Stack>
  );
};

export const loader: LoaderFunction = async ({ request }) => {
  const users = await getAllUsers();
  // getSession() is supposed to refreshToken when expired but isn't
  // it's okay for now because we only need it once from authentication
  const session = await spotifyStrategy.getSession(request);

  return { users, user: session?.user };
};

export default Index;

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
