import { Button, Flex, Heading, HStack, Link as ChakraLink } from '@chakra-ui/react';
// import type { User } from '@prisma/client';
import { Form, Link } from '@remix-run/react';
import type { User } from 'remix-auth-spotify';

export default function Nav({ user }: { user: User | null }) {
  return (
    <Flex mx="auto" w={500} as="header" py={7} mb={5} justify="space-between">
      <HStack spacing={4}>
        <Heading size="lg">Syncify</Heading>
        {/* <ChakraLink as={Link} to="/">
          Home
        </ChakraLink>
        <ChakraLink as={Link} to="/page">
          Page
        </ChakraLink> */}
      </HStack>
      <Form action={user ? '/logout' : '/auth/spotify'} method="post">
        <Button type="submit">{user ? 'Logout' : 'Log in with Spotify'}</Button>
      </Form>
    </Flex>
  );
}
