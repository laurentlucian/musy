import type { PropsWithChildren } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import Nav from './Nav';
import MobileSearchButton from './menu/MobileSearchButton';

type LayoutProps = {
  authorized: boolean;
};

const Layout = ({ authorized, children }: PropsWithChildren<LayoutProps>) => {
  return (
    <Flex justify="center">
      <Box w={{ base: '100vw', sm: '450px', md: '750px', xl: '1100px' }} px={13}>
        <Nav authorized={authorized} />
        {children}
        {!!authorized && <MobileSearchButton />}
      </Box>
    </Flex>
  );
};

export default Layout;
