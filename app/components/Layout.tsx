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
  const isNya = pathname.includes('/02mm0eoxnifin8xdnqwimls4y');
  const isMiggy = pathname.includes('/-miggy');
  const isNat = pathname.includes('/12143615383');
  const isDanica = pathname.includes('/danicadboo');
  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue('#EEE6E2', '#050404');
  const bgGradient = isNya
    ? `linear(to-t, ${bg} 40%, #FE5BAC 130%)`
    : isDanica
    ? `linear(to-t, ${bg} 40%, #563776 110%)`
    : isMiggy
    ? `linear(to-t, ${bg} 40%, #26e4f9 110%)`
    : isNat
    ? `linear(to-t, ${bg} 40%, #f2b8c6 90%)`
    : 'none';

  const isProfile = pathname.includes('home' || 'friends' || 'sessions' || 'explore');

  return (
    <Flex
      justify="center"
      bgGradient={bgGradient}
      bgAttachment="fixed"
      bg={isNya || isDanica || isMiggy || isNat ? bgGradient : bg}
      color={color}
    >
      <Box w={{ base: '100vw', md: '750px', sm: '450px', xl: '1100px' }}>
        {isSmallScreen ? <MobileHeader authorized={authorized} /> : <Nav authorized={authorized} />}
        {isProfile ? (
          <Box h={['84vh', '100%']} mt={['40px', 0]} overflowY={['scroll', 'unset']}>
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
