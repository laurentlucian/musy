import { Form } from '@remix-run/react';
import type { LoaderArgs } from '@remix-run/server-runtime';

import { Button, Flex, Heading, Stack, Text } from '@chakra-ui/react';

import { redirect } from 'remix-typedjson';

import { authenticator } from '~/services/auth.server';

const Index = () => {
  return (
    <Flex direction="column" align="center">
      <Stack mt="55px" spacing="15px" align="center" justify="center">
        <Heading size="3xl">musy</Heading>
        <Text>music & friends</Text>
      </Stack>
      {/* <Stack>
        <Heading>Send songs to your friends</Heading>
        <Text>recommend or add to their queue</Text>
      </Stack>
      <Stack align="center">
        <Heading>See what your friends are listening to</Heading>
      </Stack> */}
      <Form action="/auth/spotify" method="post">
        <Button type="submit" mt="70px" maxW="300px" variant="musy" h="40px">
          Enter with Spotify
        </Button>
      </Form>
    </Flex>
  );
};

export const loader = async ({ request }: LoaderArgs) => {
  const session = await authenticator.isAuthenticated(request);
  const url = new URL(request.url);
  if (!session && url.pathname !== '/') return redirect('/');
  if (session && url.pathname === '/') return redirect('/home');
  return null;
};

export default Index;

export { CatchBoundary } from '~/components/error/CatchBoundary';
export { ErrorBoundary } from '~/components/error/ErrorBoundary';
