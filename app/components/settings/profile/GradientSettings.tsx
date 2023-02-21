import { useSubmit } from '@remix-run/react';
import type { ChangeEvent, Dispatch, SetStateAction } from 'react';

import { FormControl, FormLabel, HStack, Switch, useColorModeValue } from '@chakra-ui/react';

import type { Theme } from '@prisma/client';

import useSessionUser from '~/hooks/useSessionUser';

const GradientSettings = ({ setTheme }: { setTheme: Dispatch<SetStateAction<Theme>> }) => {
  // const bg = useColorModeValue('music.100', 'music.800');
  const color = useColorModeValue('music.800', 'white');
  const currentUser = useSessionUser();
  const submit = useSubmit();

  const handleSwitch = (e: ChangeEvent<HTMLInputElement>) => {
    setTheme((prevTheme) => ({ ...prevTheme, gradient: e.target.checked }));
    submit(
      { gradient: `${e.target.checked}` },

      { method: 'post', replace: true },
    );
  };
  if (!currentUser) return null;
  return (
    <FormControl display="flex" alignItems="center" justifyContent="space-between">
      <HStack>
        <FormLabel fontSize={['sm', 'md']} htmlFor="gradient" mb="0" color={color}>
          Gradient Backround
        </FormLabel>
      </HStack>
      <Switch
        colorScheme="music"
        id="gradient"
        defaultChecked={currentUser.theme?.gradient ?? false}
        onChange={handleSwitch}
        size="lg"
      />
    </FormControl>
  );
};

export default GradientSettings;
