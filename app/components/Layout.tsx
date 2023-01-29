import { type PropsWithChildren, useMemo } from 'react';
import MobileSearchButton from './menu/MobileSearchButton';
import { useLocation } from '@remix-run/react';
import { Box, Flex } from '@chakra-ui/react';
import Nav from './Nav';

type LayoutProps = {
  authorized: boolean;
};

const Layout = ({ authorized, children }: PropsWithChildren<LayoutProps>) => {
  const { pathname } = useLocation();
  const isNya = useMemo(() => pathname.includes('/02mm0eoxnifin8xdnqwimls4y'), [pathname]);
  const isDanica = useMemo(() => pathname.includes('/danicadboo'), [pathname]);
  const bgGradient = isNya
    ? 'linear(to-t, #050404 40%, #FE5BAC 130%)'
    : isDanica
    ? 'linear(to-t, #050404 40%, #563776 110%)'
    : 'none';

  return (
    <Flex justify="center" bgGradient={bgGradient} bgAttachment="fixed">
      <Box w={{ base: '100vw', sm: '450px', md: '750px', xl: '1100px' }}>
        <Nav authorized={authorized} />
        {children}
        {!!authorized && <MobileSearchButton />}
      </Box>
    </Flex>
  );
};

export default Layout;
