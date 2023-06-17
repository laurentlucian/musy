import { Link, useNavigation } from '@remix-run/react';
import type { MouseEvent } from 'react';

import {
  Flex,
  Heading,
  HStack,
  Image,
  Link as ChakraLink,
  Spacer,
} from '@chakra-ui/react';

import { useSaveState, useSetShowAlert } from '~/hooks/useSaveTheme';
import Waver from '~/lib/icons/Waver';

import NavSearch from '../profile/NavSearch';
import UserMenu from './UserMenu';

const Nav = () => {
  const transition = useNavigation();
  const disable = useSaveState();
  const showAlert = useSetShowAlert();

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (disable) {
      e.preventDefault();
      showAlert();
    }
  };

  return (
    <Flex
      as="header"
      position="sticky"
      top={0}
      zIndex={1}
      justify="center"
      w="100%"
      backdropFilter="blur(27px)"
    >
      <Flex
        w={{ base: '100vw', md: '750px', sm: '450px', xl: '1100px' }}
        py={5}
        justify="space-between"
      >
        <HStack spacing="8px" zIndex={1} onClick={handleClick}>
          <HStack as={Link} to="/">
            <Image src="/musylogo1.svg" boxSize="28px" />
            <Heading size="sm">musy</Heading>
          </HStack>
          <Spacer />
          <ChakraLink as={Link} to="/explore" fontSize="sm">
            explore
          </ChakraLink>
          {transition.state === 'loading' && <Waver />}
        </HStack>
        <HStack h="39px" zIndex={1}>
          <HStack w="100%" spacing={3}>
            <NavSearch /> <UserMenu />
          </HStack>
        </HStack>
      </Flex>
    </Flex>
  );
};

export default Nav;
