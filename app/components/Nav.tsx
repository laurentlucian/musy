import { Button, Flex, Heading, HStack } from '@chakra-ui/react';
import { Form, Link, useTransition } from '@remix-run/react';
import type { User } from 'remix-auth-spotify';

export default function Nav({ user }: { user: User | null }) {
  const transition = useTransition();

  return (
    <Flex mx="auto" w={500} as="header" py={7} mb={5} justify="space-between">
      <HStack spacing={4}>
        <Heading as={Link} to="/" size="lg">
          Musy
        </Heading>
      </HStack>
      <Form action={user ? '/logout' : '/auth/spotify'} method="post">
        <Button isLoading={transition.state === 'submitting'} type="submit">
          {user ? 'Logout' : 'Log in with Spotify'}
        </Button>
      </Form>
    </Flex>
  );
}
