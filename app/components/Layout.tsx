import { useLocation } from '@remix-run/react';
import { type PropsWithChildren, useMemo } from 'react';

import { Box, Flex, useColorModeValue } from '@chakra-ui/react';

import MobileSearchButton from './menu/MobileSearchButton';
import Nav from './Nav';

type LayoutProps = {
  authorized: boolean;
};

const Layout = ({ authorized, children }: PropsWithChildren<LayoutProps>) => {
  const { pathname } = useLocation();
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
        <Nav authorized={authorized} />
        {children}
        {!!authorized && <MobileSearchButton />}
      </Box>
    </Flex>
  );
};

export default Layout;
