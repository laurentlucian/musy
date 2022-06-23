import { Flex, Heading, HStack, IconButton, useColorMode } from '@chakra-ui/react';
import { Form, Link, useTransition } from '@remix-run/react';
import { Logout, Moon, Sun1 } from 'iconsax-react';
import type { User } from 'remix-auth-spotify';

export default function Nav({ user }: { user: User | null }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const transition = useTransition();
  const busy = transition.submission?.formData.has('logout') ?? false;

  return (
    <Flex w="100%" as="header" py={[2, 5]} justify="space-between">
      <HStack spacing={4}>
        <Heading as={Link} to="/" size="sm">
          Musy
        </Heading>
      </HStack>
      <HStack>
        <IconButton
          aria-label={colorMode === 'light' ? 'Dark' : 'Light'}
          icon={colorMode === 'light' ? <Moon /> : <Sun1 />}
          variant="ghost"
          onClick={toggleColorMode}
          cursor="pointer"
        />
        {user && (
          <Form action={'/logout'} method="post">
            <IconButton
              aria-label="logout"
              name="logout"
              icon={<Logout />}
              isLoading={busy}
              variant="ghost"
              cursor="pointer"
              type="submit"
            />
          </Form>
        )}
      </HStack>
    </Flex>
  );
}
