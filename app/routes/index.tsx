import { Button, Heading, Stack, Text } from '@chakra-ui/react';

import { redirect } from 'remix-typedjson';

const Index = () => {
  return (
    <Stack>
      <Stack h="100vh" alignItems="center" justifyContent="center">
        <Heading>musy</Heading>
        <Text>music shared easy</Text>
      </Stack>
      <Stack h="100vh">
        <Heading>Send songs to your friends</Heading>
        <Text>recommend or add to their queue</Text>
      </Stack>
      <Stack h="100vh" alignItems="center">
        <Heading>See what your friends are listening to</Heading>
      </Stack>
      <Stack h="100vh">
        <Button>Log in with Spotify</Button>
      </Stack>
    </Stack>
  );
};

export const loader = () => redirect('/home');

export default Index;

export { CatchBoundary } from '~/components/error/CatchBoundary';
export { ErrorBoundary } from '~/components/error/ErrorBoundary';
