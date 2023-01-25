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
      <Center px={['40px', '100px']} height="200px">
        {/* divider is not properly rendering :( was working earlier but I do not know how to fix */}
        {/* what is "not properly rendering"? */}
        {/* :3 */}
        <Divider orientation="vertical" />
      </Center>
      <Stack></Stack>
    </Flex>
  );
};
export default Settings;
