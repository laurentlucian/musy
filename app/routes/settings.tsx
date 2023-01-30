import { Link, Stack, Center } from '@chakra-ui/react';
import { Link as RemixLink, Outlet, useLocation } from '@remix-run/react';

const Settings = () => {
  const location = useLocation();

  return (
    <Stack
      direction={['column', 'row']}
      pt={[0, 4]}
      justifyContent="center"
      overflowX="hidden"
      px={['20px', 0]}
    >
      <Stack direction={['row', 'column']}>
        <Link
          as={RemixLink}
          to="/settings"
          fontSize={['sm', 'md']}
          aria-current={location.pathname === '/settings' ? 'page' : undefined}
          _activeLink={{ opacity: 1, textDecor: 'underline' }}
        >
          Account
        </Link>
        <Link
          as={RemixLink}
          to="/settings/appearance"
          fontSize={['sm', 'md']}
          aria-current={location.pathname === '/settings/appearance' ? 'page' : undefined}
          _activeLink={{ opacity: 1, textDecor: 'underline' }}
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
