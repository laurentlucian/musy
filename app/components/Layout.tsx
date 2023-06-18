import { useLocation } from '@remix-run/react';
import type { ReactNode } from 'react';

import { Box, Flex, useColorModeValue } from '@chakra-ui/react';

import { motion } from 'framer-motion';

import useIsMobile from '~/hooks/useIsMobile';
import useCurrentUser from '~/hooks/useCurrentUser';
import { useThemeBg } from '~/hooks/useTheme';

import MobileHeader from './nav/MobileHeader';
import MobileNavBar from './nav/MobileNavBar';
import Nav from './nav/Nav';

const Layout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const currentUser = useCurrentUser();
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
      bgAttachment="scroll, local"
      css={{ '::-webkit-scrollbar': { display: 'none' } }}
      h="max-content"
    >
      <Flex as="section" direction="column" h="max-content" w="100%" align="center">
        {isSmallScreen ? <MobileHeader /> : <Nav />}
        <Box
          w={{ base: '100vw', md: '750px', sm: '450px', xl: '1100px' }}
          py="10px"
          as={motion.div}
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {children}
        </Box>
        <MobileNavBar />
      </Flex>
    </Flex>
  );
};

export default Layout;
