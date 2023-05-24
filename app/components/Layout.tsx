import { useLocation } from '@remix-run/react';
import type { ReactNode } from 'react';

import { Box, Flex, useColorModeValue } from '@chakra-ui/react';

import { motion } from 'framer-motion';

import useIsMobile from '~/hooks/useIsMobile';
import useSessionUser from '~/hooks/useSessionUser';
import { useThemeBg } from '~/hooks/useTheme';

import MobileHeader from './nav/MobileHeader';
import MobileNavBar from './nav/MobileNavBar';
import Nav from './nav/Nav';

const Layout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const currentUser = useSessionUser();
  const isSmallScreen = useIsMobile();
  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue('#EEE6E2', '#050404');
  const isProfile = !pathname.includes(
    'home' || 'friends' || 'sessions' || 'explore' || 'settings',
  );
  const { bgGradient, gradient, profileBg } = useThemeBg();

  if (!currentUser) return <>{children}</>;

  return (
    <Flex
      justify="center"
      as="main"
      color={color}
      bg={isProfile ? profileBg : bg}
      bgGradient={gradient ? bgGradient : undefined}
      bgAttachment="fixed"
      overflow={['hidden', 'unset']}
      css={{ '::-webkit-scrollbar': { display: 'none' } }}
    >
      <Flex
        as="section"
        direction="column"
        w={{ base: '100vw', md: '750px', sm: '450px', xl: '1100px' }}
        overflow={['hidden', 'unset']}
      >
        {isSmallScreen ? <MobileHeader /> : <Nav />}
        <Box
          py="10px"
          as={motion.div}
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          h={'84.2dvh'} // @todo make scroll work without this
          overflowX={['hidden', 'unset']}
          //transition={{ duration: 0.8 }}
        >
          {children}
        </Box>
        <MobileNavBar />
      </Flex>
    </Flex>
  );
};

export default Layout;
