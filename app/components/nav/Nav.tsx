import { Form, Link, useLocation, useTransition } from '@remix-run/react';

import { Button, Flex, Heading, HStack, Image, useColorModeValue } from '@chakra-ui/react';

import useIsMobile from '~/hooks/useIsMobile';

import SpotifyLogo from '../icons/SpotifyLogo';
import Waver from '../icons/Waver';
import NavSearch from './NavSearch';
import UserMenu from './UserMenu';
// import UserSearch from './UserSearch';

const Nav = ({ authorized }: { authorized: boolean }) => {
  const transition = useTransition();
  const { pathname, search } = useLocation();
  const isSmallScreen = useIsMobile();
  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue('music.200', 'music.900');

  return (
    <Flex w="100%" as="header" py={5} justify="space-between" px={0} zIndex={1}>
      <HStack as={Link} to="/" spacing="8px" zIndex={1}>
        <Image src="/favicon-32x32.png" />
        <Heading size="sm">musy</Heading>
        {transition.state === 'loading' && <Waver />}
      </HStack>
      <HStack h="39px" zIndex={1}>
        {!authorized ? (
          <Form action={'/auth/spotify?returnTo=' + pathname + search} method="post">
            <Button
              type="submit"
              variant="login"
              spinner={<Waver />}
              isLoading={transition.submission?.action.includes('auth')}
              bg={bg}
              color={color}
            >
              Login with &nbsp; <SpotifyLogo h="24px" w="85px" link={false} />
            </Button>
          </Form>
        ) : (
          <>
            <HStack w="100%" spacing={3}>
              <NavSearch /> <UserMenu isSmallScreen={isSmallScreen} pathname={pathname} />
            </HStack>
          </>
        )}
      </HStack>
    </Flex>
  );
};

export default Nav;
