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
  const [isDanica, setIsDanica] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    pathname === '/02mm0eoxnifin8xdnqwimls4y' ? setIsNya(true) : setIsNya(false);
  }, [pathname]);
  useEffect(() => {
    pathname === '/danicadboo' ? setIsDanica(true) : setIsDanica(false);
  }, [pathname]);
  const bgGradient = isNya
    ? 'linear(to-t, #050404 40%, #ff1dce 140%)'
    : isDanica
    ? 'linear(to-t, #050404 40%, #563776 110%)'
    : 'none';

  return (
    <Flex justify="center" bgGradient={bgGradient} bgAttachment="fixed">
      <Box w={{ base: '100vw', sm: '450px', md: '750px', xl: '1100px' }} px={13}>
        <Nav authorized={authorized} />
        {children}
        {!!authorized && <MobileSearchButton />}
      </Box>
    </Flex>
  );
};

export default Layout;
