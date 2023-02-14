import { useLocation } from '@remix-run/react';
import { type PropsWithChildren, useMemo } from 'react';

import { Box, Flex, useColorModeValue } from '@chakra-ui/react';

import useIsMobile from '~/hooks/useIsMobile';

import MobileHeader from './nav/MobileHeader';
import MobileNavBar from './nav/MobileNavBar';
import Nav from './nav/Nav';

type LayoutProps = {
  authorized: boolean;
  profilePicture?: string;
  userId?: string;
};

const Layout = ({
  authorized,
  children,
  profilePicture,
  userId,
}: PropsWithChildren<LayoutProps>) => {
  const { pathname } = useLocation();
  const isSmallScreen = useIsMobile();
  const isNya = useMemo(() => pathname.includes('/02mm0eoxnifin8xdnqwimls4y'), [pathname]);
  const isDanica = useMemo(() => pathname.includes('/danicadboo'), [pathname]);
  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue('#EEE6E2', '#050404');
  const bgGradient = isNya
    ? `linear(to-t, ${bg} 40%, #FE5BAC 130%)`
    : isDanica
    ? `linear(to-t, ${bg} 40%, #563776 110%)`
    : 'none';

  return (
    <Flex
      justify="center"
      bgGradient={bgGradient}
      bgAttachment="fixed"
      bg={isNya || isDanica ? bgGradient : bg}
      color={color}
    >
      <Box w={{ base: '100vw', md: '750px', sm: '450px', xl: '1100px' }}>
        {isSmallScreen ? <MobileHeader authorized={authorized} /> : <Nav authorized={authorized} />}
        {children}
        {isSmallScreen && <MobileNavBar profilePicture={profilePicture} userId={userId} />}
      </Box>
    </Flex>
  );
};

export default Layout;
