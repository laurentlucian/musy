import { Flex, Heading, HStack, IconButton, Input, useColorMode } from '@chakra-ui/react';
import { Form, Link, useLocation, useTransition } from '@remix-run/react';
import { Login, Logout, Moon, Sun1 } from 'iconsax-react';
import type { User } from 'remix-auth-spotify';

const Nav = ({ user }: { user: User | null }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const transition = useTransition();
  const location = useLocation();
  const busy =
    (transition.submission?.formData.has('logout') ||
      transition.submission?.formData.has('login')) ??
    false;
  // don't display login button on Index page (where there's a join button)
  // both shows loading same if join is cliced (@todo separate loading states)
  const showAuth = user ? true : location.pathname === '/' ? false : true;

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

        {showAuth && (
          <Form action={user ? '/logout' : '/auth/spotify?' + location.pathname} method="post">
            {user && <Input type="hidden" value={location.pathname} name="redirectTo" />}
            <IconButton
              aria-label={user ? 'logout' : 'login'}
              name={user ? 'logout' : 'login'}
              icon={user ? <Logout /> : <Login />}
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
};

export default Nav;
