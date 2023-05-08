import { useLocation } from '@remix-run/react';
import type { ReactNode } from 'react';

import { Box, Flex, useColorModeValue } from '@chakra-ui/react';

import { motion } from 'framer-motion';

import useIsMobile from '~/hooks/useIsMobile';
import { useThemeBg } from '~/hooks/useTheme';

import MobileHeader from './nav/MobileHeader';
import Nav from './nav/Nav';

const Layout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const isSmallScreen = useIsMobile();
  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue('#EEE6E2', '#050404');
  const isNotProfile = pathname.includes(
    'home' || 'friends' || 'sessions' || 'explore' || 'settings',
  );
  const { bgGradient, gradient, profileBg } = useThemeBg();

  return (
    <Flex
      justify="center"
      color={color}
      w="100%"
      h="100%"
      bg={isNotProfile ? bg : profileBg}
      bgGradient={gradient ? bgGradient : undefined}
      bgAttachment="fixed"
      overflowY="scroll"
      css={{ '::-webkit-scrollbar': { display: 'none' } }}
    >
      <Box w={{ base: '100vw', md: '750px', sm: '450px', xl: '1100px' }}>
        {isSmallScreen ? <MobileHeader /> : <Nav />}
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {!isNotProfile ? (
            children
          ) : (
            <Box h={['87vh', '100%']} mt={['40px', 0]} overflowY={['scroll', 'unset']}>
              {children}
            </Box>
          )}
        </motion.div>
      </Box>
    </Flex>
  );
};

export default Layout;
