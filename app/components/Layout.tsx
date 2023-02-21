import { useLocation } from '@remix-run/react';
import type { ReactNode } from 'react';

import { Box, Flex, useColorModeValue } from '@chakra-ui/react';

import useIsMobile from '~/hooks/useIsMobile';
import useSessionUser from '~/hooks/useSessionUser';

import MobileHeader from './nav/MobileHeader';
import MobileNavBar from './nav/MobileNavBar';
import Nav from './nav/Nav';

const Layout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const isSmallScreen = useIsMobile();
  const currentUser = useSessionUser();
  const authorized = !!currentUser;
  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue('#EEE6E2', '#050404');
  const isProfile = pathname.includes('home' || 'friends' || 'sessions' || 'explore');

  return (
    <Flex justify="center" color={color} w="100%" h="100%" bg={bg}>
      <Box w={{ base: '100vw', md: '750px', sm: '450px', xl: '1100px' }} h="100%">
        {isSmallScreen ? <MobileHeader authorized={authorized} /> : <Nav authorized={authorized} />}
        {isProfile ? (
          <Box h={['87vh', '100%']} mt={['40px', 0]} overflowY={['scroll', 'unset']}>
            {children}
          </Box>
        ) : (
          children
        )}
        {isSmallScreen && <MobileNavBar />}
      </Box>
    </Flex>
  );
};

export default Layout;
