import { Button, Flex, Heading, HStack, Image, useColorModeValue } from '@chakra-ui/react';
import { Form, Link, useLocation, useTransition } from '@remix-run/react';
import Spotify_Logo_Black from '~/assets/Spotify_Logo_Black.png';
import Spotify_Logo_White from '~/assets/Spotify_Logo_White.png';
import Waver from './Waver';
import Settings from './Settings';
import UserSearch from './UserSearch';
import { useState } from 'react';
import useIsMobile from '~/hooks/useIsMobile';

const Nav = ({ authorized }: { authorized: boolean }) => {
  const [show, setShow] = useState(true);
  const spotify_logo = useColorModeValue(Spotify_Logo_Black, Spotify_Logo_White);
  const transition = useTransition();
  const { pathname, search } = useLocation();
  const isSmallScreen = useIsMobile();

  return (
    <Flex w="100%" as="header" py={[2, 5]} justify="space-between">
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
