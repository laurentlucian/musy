import { useLocation } from '@remix-run/react';
import type { ReactNode } from 'react';

import { Box, Flex, useColorModeValue } from '@chakra-ui/react';

import { motion } from 'framer-motion';

import useIsMobile from '~/hooks/useIsMobile';

import MobileHeader from './nav/MobileHeader';
import Nav from './nav/Nav';

const Layout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const isSmallScreen = useIsMobile();
  const color = useColorModeValue('#161616', '#EEE6E2');
  const bg = useColorModeValue('#EEE6E2', '#050404');
  const isProfile = pathname.includes('home' || 'friends' || 'sessions' || 'explore');

  return (
    <Flex justify="center" color={color} w="100%" h="100%" bg={bg}>
      <Box w={{ base: '100vw', md: '750px', sm: '450px', xl: '1100px' }} h="100%">
        {isSmallScreen ? <MobileHeader /> : <Nav />}
        {!isProfile ? (
          <motion.div
            key={pathname}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }} // I dont think this is doing anything
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        ) : (
          <motion.div
            key={pathname}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }} // I dont think this is doing anything
            transition={{ duration: 0.5 }}
          >
            <Box h={['87vh', '100%']} mt={['40px', 0]} overflowY={['scroll', 'unset']}>
              {children}
            </Box>
          </motion.div>
        )}
      </Box>
    </Flex>
  );
};

export default Layout;
