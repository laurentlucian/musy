import type { PropsWithChildren } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import Nav from './Nav';
import type { User } from 'remix-auth-spotify';

type LayoutProps = {
  user: User | null;
};

const Layout = ({ user, children }: PropsWithChildren<LayoutProps>) => {
  return (
    <Flex justify="center">
      <Box w={{ base: '100vw', sm: '450px', md: '750px', xl: '1100px' }} px={13}>
        <Nav user={user} />
        {children}
      </Box>
    </Flex>
  );
};

export default Layout;
