import { Form, useNavigation } from '@remix-run/react';
import type { LoaderArgs } from '@remix-run/server-runtime';

import { Button, Flex, Heading, Image, Stack, Text } from '@chakra-ui/react';

import { redirect } from 'remix-typedjson';

import { authenticator } from '~/services/auth.server';

const Index = () => {
  const navigation = useNavigation();
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
      <Flex direction="column" align="center" mt="30px">
        <Image src="/musylogo1.svg" w="300px" mb="-40px" ml="-14px" />
        <Form action="/api/auth/spotify" method="post">
          <Button
            type="submit"
            isLoading={navigation.state === 'submitting'}
            variant="musy"
            size="lg"
          >
            Enter with Spotify
          </Button>
        </Form>
      </Flex>
    </Flex>
  );
};

export const loader = async ({ request }: LoaderArgs) => {
  const session = await authenticator.isAuthenticated(request);
  const url = new URL(request.url);
  if (session && url.pathname === '/') return redirect('/home');
  return null;
};

export { ErrorBoundary } from '~/components/error/ErrorBoundary';
export default Index;
