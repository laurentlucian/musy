import { type PropsWithChildren, useEffect, useState } from 'react';
import MobileSearchButton from './menu/MobileSearchButton';
import { useLocation } from '@remix-run/react';
import { Box, Flex } from '@chakra-ui/react';
import Nav from './Nav';

type LayoutProps = {
  authorized: boolean;
};

const Layout = ({ authorized, children }: PropsWithChildren<LayoutProps>) => {
  const [isNya, setIsNya] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    pathname === '/02mm0eoxnifin8xdnqwimls4y' ? setIsNya(true) : setIsNya(false);
  }, [pathname]);

  return (
    <Flex
      justify="center"
      bgGradient={isNya ? 'linear(to-t, #050404 40%, pink 110%)' : 'none'}
      bgAttachment="fixed"
    >
      <Box w={{ base: '100vw', sm: '450px', md: '750px', xl: '1100px' }} px={13}>
        <Nav authorized={authorized} />
        {children}
        {!!authorized && <MobileSearchButton />}
      </Box>
    </Flex>
  );
};

export default Layout;
