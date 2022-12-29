import { Link, Stack, Divider, Center, Flex } from '@chakra-ui/react';
import { Link as RemixLink, Outlet, useLocation } from '@remix-run/react';

const Settings = () => {
  const location = useLocation();

  return (
    <Flex pt={4}>
      <Stack>
        <Link
          as={RemixLink}
          to="/settings"
          aria-current={location.pathname === '/settings' ? 'page' : undefined}
          _activeLink={{ opacity: 1, textDecor: 'underline' }}
        >
          Account
        </Link>
        <Link
          as={RemixLink}
          to="/settings/appearance"
          aria-current={location.pathname === '/settings/appearance' ? 'page' : undefined}
          _activeLink={{ opacity: 1, textDecor: 'underline' }}
        >
          Appearance
        </Link>
      </Stack>
      <Center px={['50px', '100px']} height="200px">
        {/* divider is not properly rendering :( was working earlier but I do not know how to fix */}
        {/* what is "not properly rendering"? */}
        <Divider orientation="vertical" />
      </Center>
      <Stack>
        <Outlet />
      </Stack>
    </Flex>
  );
};
export default Settings;
