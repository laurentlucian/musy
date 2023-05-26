import { Link, useNavigation } from '@remix-run/react';
import type { MouseEvent } from 'react';

import {
  Flex,
  Heading,
  HStack,
  Image,
  useColorModeValue,
  Link as ChakraLink,
  Spacer,
} from '@chakra-ui/react';

import { useSaveState, useSetShowAlert } from '~/hooks/useSaveTheme';
import Waver from '~/lib/icons/Waver';

import NavSearch from './NavSearch';
import UserMenu from './UserMenu';

const Nav = () => {
  const transition = useNavigation();
  const bg = useColorModeValue('musy.200', 'black');
  const disable = useSaveState();
  const showAlert = useSetShowAlert();

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (disable) {
      e.preventDefault();
      showAlert();
    }
  };

  return (
    <Flex position="sticky" top={0} bg={bg} as="header" py={5} justify="space-between" zIndex={1}>
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
  );
};

export default Nav;
