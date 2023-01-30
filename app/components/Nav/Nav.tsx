import { Form, Link, useLocation, useTransition } from '@remix-run/react';
import { useState } from 'react';

import { Button, Flex, Heading, HStack, Image, useColorModeValue } from '@chakra-ui/react';

import useIsMobile from '~/hooks/useIsMobile';

import SpotifyLogo from '../icons/SpotifyLogo';
import Waver from '../icons/Waver';
import Settings from './Settings';
import UserSearch from './UserSearch';

const Nav = ({ authorized }: { authorized: boolean }) => {
  const [show, setShow] = useState(true);
  const transition = useTransition();
  const { pathname, search } = useLocation();
  const isSmallScreen = useIsMobile();
  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue('music.200', 'music.900');

  return (
    <Flex w="100%" as="header" py={[2, 5]} justify="space-between" px={isSmallScreen ? '5px' : 0}>
      <HStack as={Link} to="/" spacing="8px">
        {isSmallScreen ? (
          <Image src="/musylogo1.svg" boxSize="35px" />
        ) : (
          <Image src="/favicon-32x32.png" />
        )}
        <Heading size="sm" onClick={() => setShow(true)}>
          musy
        </Heading>
        {transition.state === 'loading' && <Waver />}
      </HStack>
      <HStack h="39px">
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
            <UserSearch />
            <Settings show={show} setShow={setShow} />
          </>
        )}
      </HStack>
    </Flex>
  );
};

export default Nav;
