import { useSubmit } from '@remix-run/react';

import { FormControl, FormLabel, HStack, Switch, useColorModeValue } from '@chakra-ui/react';

import useSessionUser from '~/hooks/useSessionUser';

const GradientSettings = () => {
  const bg = useColorModeValue('music.100', 'music.800');
  const color = useColorModeValue('music.800', 'white');
  const currentUser = useSessionUser();
  const submit = useSubmit();
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
        onChange={(e) => {
          submit(
            { gradient: `${e.target.checked}` },

            { method: 'post', replace: true },
          );
        }}
        size="lg"
      />
    </FormControl>
  );
};

export default GradientSettings;
