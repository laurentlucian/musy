import { Form, Link, useLocation, useNavigation } from '@remix-run/react';
import type { MouseEvent } from 'react';

import {
  Button,
  Flex,
  Heading,
  HStack,
  Image,
  useColorModeValue,
  Link as ChakraLink,
  Spacer,
} from '@chakra-ui/react';

import { useSaveState, useSetShowAlert } from '~/hooks/useSaveTheme';
import useSessionUser from '~/hooks/useSessionUser';
import Waver from '~/lib/icons/Waver';

import NavSearch from './NavSearch';
import UserMenu from './UserMenu';

const Nav = () => {
  const transition = useNavigation();
  const { pathname, search } = useLocation();
  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue('musy.200', 'musy.900');
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
      <HStack spacing="8px" zIndex={1} onClick={handleClick}>
        <HStack as={Link} to="/">
          <Image src="/musylogo1.svg" boxSize="28px" />
          <Heading size="sm">musy</Heading>
        </HStack>
        <Spacer />
        <ChakraLink as={Link} to="/friends" fontSize="sm">
          friends
        </ChakraLink>
        <ChakraLink as={Link} to="/explore" fontSize="sm">
          explore
        </ChakraLink>
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
              isLoading={transition.formAction?.includes('auth')}
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
