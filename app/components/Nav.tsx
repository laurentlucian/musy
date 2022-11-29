import {
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Image,
  Input,
  useColorMode,
  useColorModeValue,
  useMediaQuery,
} from '@chakra-ui/react';
import { Form, Link, useLocation, useTransition } from '@remix-run/react';
import { Logout, Moon, Sun1 } from 'iconsax-react';
import type { User } from 'remix-auth-spotify';
import Tooltip from './Tooltip';
import Spotify_Logo_Black from '~/assets/Spotify_Logo_Black.png';
import Spotify_Logo_White from '~/assets/Spotify_Logo_White.png';
import useTransitionElement from '~/hooks/useTransitionElement';

const Nav = ({ user }: { user: User | null }) => {
  const spotify_logo = useColorModeValue(Spotify_Logo_Black, Spotify_Logo_White);
  const { colorMode, toggleColorMode } = useColorMode();
  const transition = useTransition();
  const loaderElement = useTransitionElement();
  const location = useLocation();
  const [isSmallScreen] = useMediaQuery('(max-width: 600px)');
  const busy =
    (transition.submission?.formData.has('logout') ||
      transition.submission?.formData.has('login')) ??
    false;

  // don't display login button on Index page (where there's a join button)
  // both shows loading same if join is cliced (@todo separate loading states)
  // const showAuth = user ? true : location.pathname === '/' ? false : true;

  return (
    <Flex w="100%" as="header" py={[2, 5]} justify="space-between">
      <HStack spacing={4}>
        <Heading as={Link} to="/" size="sm">
          Musy
        </Heading>
        {isSmallScreen && loaderElement}
      </HStack>
      <HStack h="39px">
        {!user && (
          <Form action="/auth/spotify" method="post">
            <Input type="hidden" value="/" name="redirectTo" />
            <Button
              isLoading={transition.state === 'submitting'}
              type="submit"
              h="39px"
              borderRadius="7px"
            >
              Login with &nbsp; <Image height="24px" width="85px" src={spotify_logo} />
            </Button>
          </Form>
        )}
        <IconButton
          aria-label={colorMode === 'light' ? 'Dark' : 'Light'}
          icon={colorMode === 'light' ? <Moon /> : <Sun1 />}
          variant="ghost"
          onClick={toggleColorMode}
          cursor="pointer"
        />

        {user && (
          <Form action={'/logout'} method="post">
            {user && <Input type="hidden" value={location.pathname} name="redirectTo" />}
            <Tooltip label="Logout">
              <IconButton
                aria-label="logout"
                name="logout"
                icon={<Logout />}
                isLoading={busy}
                variant="ghost"
                cursor="pointer"
                type="submit"
              />
            </Tooltip>
          </Form>
        )}
      </HStack>
    </Flex>
  );
};

export default Nav;
