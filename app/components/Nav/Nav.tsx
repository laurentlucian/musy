import { Form, Link, useLocation, useTransition } from '@remix-run/react';
import { Button, Flex, Heading, HStack, Image } from '@chakra-ui/react';
import useIsMobile from '~/hooks/useIsMobile';
import SpotifyLogo from '../icons/SpotifyLogo';
import UserSearch from './UserSearch';
import Settings from './Settings';
import Waver from '../icons/Waver';
import { useState } from 'react';

const Nav = ({ authorized }: { authorized: boolean }) => {
  const [show, setShow] = useState(true);
  const transition = useTransition();
  const { pathname, search } = useLocation();
  const isSmallScreen = useIsMobile();

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
