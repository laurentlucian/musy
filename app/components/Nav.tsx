import {
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Image,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import { Form, Link, useLocation, useTransition } from '@remix-run/react';
import { Logout, Moon, Sun1 } from 'iconsax-react';
import Tooltip from './Tooltip';
import Spotify_Logo_Black from '~/assets/Spotify_Logo_Black.png';
import Spotify_Logo_White from '~/assets/Spotify_Logo_White.png';
import Waver from './Waver';

const Nav = ({ authorized }: { authorized: boolean }) => {
  const spotify_logo = useColorModeValue(Spotify_Logo_Black, Spotify_Logo_White);
  const { colorMode, toggleColorMode } = useColorMode();
  const transition = useTransition();
  const { pathname, search } = useLocation();
  const busy =
    (transition.submission?.formData.has('logout') ||
      transition.submission?.formData.has('login')) ??
    false;

  return (
    <Flex w="100%" as="header" py={[2, 5]} justify="space-between">
      <HStack spacing={4}>
        <Heading as={Link} to="/" size="sm">
          Musy
        </Heading>
        {transition.state === 'loading' && <Waver />}
      </HStack>
      <HStack h="39px">
        {!authorized && (
          <Form action={'/auth/spotify?returnTo=' + pathname + search} method="post">
            <Button
              isLoading={transition.submission?.action.includes('auth')}
              type="submit"
              h="39px"
              borderRadius="7px"
              w="200px"
              spinner={<Waver />}
            >
              Login with &nbsp; <Image height="24px" width="85px" src={spotify_logo} />
            </Button>
          </Form>
        )}

        {authorized && (
          <Form action={'/logout'} method="post">
            <input type="hidden" value={pathname + search} name="redirectTo" />
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
        <IconButton
          aria-label={colorMode === 'light' ? 'Dark' : 'Light'}
          icon={colorMode === 'light' ? <Moon /> : <Sun1 />}
          variant="ghost"
          onClick={toggleColorMode}
          cursor="pointer"
        />
      </HStack>
    </Flex>
  );
};

export default Nav;
