import { Link as RemixLink, Outlet, useLocation } from '@remix-run/react';

import { Link, Stack, useColorModeValue, Divider, Box } from '@chakra-ui/react';

import useIsMobile from '~/hooks/useIsMobile';

const Settings = () => {
  const isSmallScreen = useIsMobile();
  const location = useLocation();
  const color = useColorModeValue('#050404', '#EEE6E2');
  const bg = useColorModeValue('#EEE6E2', '#050404');

  return (
    <Stack
      direction={['column', 'row']}
      pt={['60px', 4]}
      justifyContent={['start', 'space-between']}
      overflowX="hidden"
      px={['20px', 0]}
      bg={bg}
      h="100%"
      w={{ base: '100vw', md: '750px', sm: '450px', xl: '1100px' }}
    >
      <Stack direction={['row', 'column']} w="110px" h="100%">
        <Link
          as={RemixLink}
          to="/settings"
          replace
          fontSize={['sm', 'md']}
          aria-current={location.pathname === '/settings' ? 'page' : undefined}
          _activeLink={{ opacity: 1, textDecor: 'underline' }}
          color={color}
          w="80px"
        >
          account
        </Link>
        <Link
          as={RemixLink}
          to="/settings/appearance"
          replace
          fontSize={['sm', 'md']}
          aria-current={location.pathname === '/settings/appearance' ? 'page' : undefined}
          _activeLink={{ opacity: 1, textDecor: 'underline' }}
          color={color}
          w="110px"
        >
          appearance
        </Link>
      </Stack>
      {isSmallScreen ? (
        <Divider bg={color} orientation="horizontal" w="100vh" alignSelf="center" />
      ) : (
        <>
          <Divider bg={color} orientation="vertical" h="86vh" />
          <Box w="30px" />
        </>
      )}
      <Outlet />
    </Stack>
  );
};
export default Settings;
