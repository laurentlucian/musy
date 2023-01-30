import { Link as RemixLink, Outlet, useLocation } from '@remix-run/react';

import { Link, Stack, Center, useColorModeValue } from '@chakra-ui/react';

const Settings = () => {
  const location = useLocation();
  const color = useColorModeValue('#050404', '#EEE6E2');
  const bg = useColorModeValue('#EEE6E2', '#050404');

  return (
    <Stack
      direction={['column', 'row']}
      pt={[0, 4]}
      justifyContent={['start', 'center']}
      overflow="hidden"
      px={['20px', 0]}
      bg={bg}
      h="100vh"
    >
      <Stack direction={['row', 'column']}>
        <Link
          as={RemixLink}
          to="/settings"
          fontSize={['sm', 'md']}
          aria-current={location.pathname === '/settings' ? 'page' : undefined}
          _activeLink={{ opacity: 1, textDecor: 'underline' }}
          color={color}
        >
          Account
        </Link>
        <Link
          as={RemixLink}
          to="/settings/appearance"
          fontSize={['sm', 'md']}
          aria-current={location.pathname === '/settings/appearance' ? 'page' : undefined}
          _activeLink={{ opacity: 1, textDecor: 'underline' }}
          color={color}
        >
          Appearance
        </Link>
      </Stack>
      <Center px={['40px', '100px']} height={[0, '200px']}>
        {/* <Divider orientation="vertical" /> */}
      </Center>
      <Outlet />
    </Stack>
  );
};
export default Settings;
