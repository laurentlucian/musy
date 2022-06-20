import { Button, Flex, Heading, HStack } from '@chakra-ui/react';
import { Form, Link, useTransition } from '@remix-run/react';
import type { User } from 'remix-auth-spotify';

export default function Nav({ user }: { user: User | null }) {
  const transition = useTransition();

  return (
    <Flex w={['100vw', '100%']} as="header" px={13} py={[2, 5]} mb={0} justify="space-between">
      <HStack spacing={4}>
        <Heading as={Link} to="/" size="sm">
          Musy
        </Heading>
      </HStack>
      {user && (
        <Form action={'/logout'} method="post">
          <Button size="sm" isLoading={transition.state === 'submitting'} type="submit">
            Logout
          </Button>
        </Form>
      )}
    </Flex>
  );
}
