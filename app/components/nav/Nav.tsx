import { Form, Link, useLocation, useTransition } from '@remix-run/react';
import type { MouseEvent } from 'react';

import {
  Button,
  Flex,
  Heading,
  HStack,
  Image,
  useColorModeValue,
  Link as ChakraLink,
} from '@chakra-ui/react';

import { useSaveState, useSetShowAlert } from '~/hooks/useSave';
import useSessionUser from '~/hooks/useSessionUser';

import Waver from '../../lib/icons/Waver';
import NavSearch from './NavSearch';
import UserMenu from './UserMenu';

const Nav = () => {
  const transition = useTransition();
  const { pathname, search } = useLocation();
  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue('music.200', 'music.900');
  const currentUser = useSessionUser();
  const authorized = !!currentUser;
  const disable = useSaveState();
  const showAlert = useSetShowAlert();

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (disable) {
      e.preventDefault();
      showAlert();
    }
  };

  return (
    <Flex w="100%" as="header" py={5} justify="space-between" px={0} zIndex={1}>
      <HStack as={Link} to="/" spacing="8px" zIndex={1} onClick={handleClick}>
        <Image src="/favicon-32x32.png" />
        <Heading size="sm">musy</Heading>
        <ChakraLink as={Link} to="/sessions" fontSize="sm">
          sessions
        </ChakraLink>
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
              Login
            </Button>
          </Form>
        ) : (
          <>
            <HStack w="100%" spacing={3}>
              <NavSearch /> <UserMenu />
            </HStack>
          </>
        )}
      </HStack>
    </Flex>
  );
};

export default Nav;
