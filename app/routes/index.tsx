import { Button, Heading, HStack, Image, Input, Stack, Text } from '@chakra-ui/react';
import type { Profile } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import { Form, Link, useCatch, useLoaderData, useTransition } from '@remix-run/react';
import Layout from '~/components/Layout';

import { authenticator, getAllUsers } from '~/services/auth.server';

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
            isLoading={
              transition.state === 'loading' && transition.location.pathname.includes(user.userId)
            }
            key={user.userId}
            variant="ghost"
            h="auto"
            p={2}
          >
            <HStack spacing={3} w="100%">
              <Image w="50px" borderRadius={50} src={user.image} />
              <Text fontWeight="bold">{user.name}</Text>
            </HStack>
          </Button>
        );
      })}
      {!user && (
        <Form action="/auth/spotify" method="post">
          <Input type="hidden" value="/" name="redirectTo" />
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
  const session = await authenticator.isAuthenticated(request);

  return { users, user: session?.user };
};

export default Index;

export const ErrorBoundary = ({ error }: { error: Error }) => {
  console.error(error);
  return (
    <Layout user={null}>
      <Heading fontSize={['xl', 'xxl']}>Oops, unhandled error</Heading>
      <Text fontSize="md">Trace(for debug): {error.message}</Text>
    </Layout>
  );
};

export const CatchBoundary = () => {
  let caught = useCatch();
  let message;
  switch (caught.status) {
    case 401:
      message = <Text>Oops, you shouldn't be here (No access)</Text>;
      break;
    case 404:
      message = <Text>Oops, you shouldn't be here (Page doesn't exist)</Text>;
      break;

    default:
      throw new Error(caught.data || caught.statusText);
  }

  return (
    <Layout user={null}>
      <Heading fontSize={['xl', 'xxl']}>
        {caught.status}: {caught.statusText}
      </Heading>
      <Text fontSize="md">{message}</Text>
    </Layout>
  );
};
