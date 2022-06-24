import type { PropsWithChildren, ReactElement } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import type { User } from 'remix-auth-spotify';

import Nav from './Nav';

type AppLayoutProps = {
  user: User | null;
};

export default function Layout({
  user,
  children,
}: PropsWithChildren<AppLayoutProps>): ReactElement {
  return (
    <Flex justify="center">
      <Box w={{ base: '100vw', sm: '450px', md: '750px', xl: '1100px' }} px={13}>
        <Nav user={user} />
        {children}
      </Box>
    </Flex>
  );
}
