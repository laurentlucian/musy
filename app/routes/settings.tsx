import { Button, Stack, Divider } from '@chakra-ui/react';
import { Outlet, useNavigate } from '@remix-run/react';
import { useState } from 'react';

const Settings = () => {
  const [setting, setSetting] = useState('');
  const navigate = useNavigate();
  // each button navigates to a route within settings
  return (
    <Stack direction="row" h="100px" p={4}>
      <Stack alignItems="flex-start" pr="100px">
        <Button
          variant="unstyled"
          onClick={() => {
            setSetting('Account');
            navigate(`/settings/account`);
          }}
          cursor="pointer"
          _active={{ opacity: 1, textDecor: 'underline' }}
          isActive={setting === 'Account'}
        >
          Account
        </Button>
        <Button
          variant="unstyled"
          onClick={() => {
            setSetting('Privacy');
            navigate(`/settings/privacy`);
          }}
          cursor="pointer"
          _active={{ opacity: 1, textDecor: 'underline' }}
          isActive={setting === 'Privacy'}
        >
          Privacy
        </Button>
        <Button
          variant="unstyled"
          onClick={() => {
            setSetting('Appearance');
            navigate(`/settings/appearance`);
          }}
          cursor="pointer"
          _active={{ opacity: 1, textDecor: 'underline' }}
          isActive={setting === 'Appearance'}
        >
          Appearance
        </Button>
      </Stack>
      <Stack border="solid 1px gray">
        {/* divider is not properly rendering :( was working earlier but I do not know how to fix */}
        <Divider orientation="vertical" width="fit-content" border="solid 1px blue" />
      </Stack>
      <Stack pl="40px">
        <Outlet />
      </Stack>
    </Stack>
  );
};
export default Settings;
