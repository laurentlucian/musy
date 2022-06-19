import { Button, Flex, Heading, HStack } from '@chakra-ui/react';
import { Form, Link, useTransition } from '@remix-run/react';
import type { User } from 'remix-auth-spotify';

export default function Nav({ user }: { user: User | null }) {
  const transition = useTransition();

  return (
    <Flex mx={['0', 'auto']} w={['100vw', 500]} as="header" px={2} py={2} mb={0} justify="space-between">
      <HStack spacing={4}>
        <Heading as={Link} to="/" size="sm">
          Musy
        </Heading>
      </HStack>
      {/* <Form action={user ? '/logout' : '/auth/spotify'} method="post">
        <Button isLoading={transition.state === 'submitting'} type="submit">
          {user ? 'Logout' : 'Login'}
        </Button>
      </Form> */}
    </Flex>
  );
}
