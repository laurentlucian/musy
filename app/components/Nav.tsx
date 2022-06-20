import { Button, Flex, Heading, HStack, useColorMode } from '@chakra-ui/react';
import { Form, Link, useTransition } from '@remix-run/react';
import type { User } from 'remix-auth-spotify';

export default function Nav({ user }: { user: User | null }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const transition = useTransition();

  return (
    <Flex w="100%" as="header" py={[2, 5]} justify="space-between">
      <HStack spacing={4}>
        <Heading as={Link} to="/" size="sm">
          Musy
        </Heading>
      </HStack>
      <HStack>
        <Button size="sm" onClick={toggleColorMode}>
          {colorMode === 'light' ? 'Dark' : 'Light'}
        </Button>
        {user && (
          <Form action={'/logout'} method="post">
            <Button size="sm" isLoading={transition.state === 'submitting'} type="submit">
              Logout
            </Button>
          </Form>
        )}
      </HStack>
    </Flex>
  );
}
