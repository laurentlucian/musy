import { useSubmit } from '@remix-run/react';
import type { Dispatch, SetStateAction } from 'react';

import { FormControl, FormLabel, HStack, IconButton, useColorModeValue } from '@chakra-ui/react';

import type { Theme } from '@prisma/client';
import { ArrowDown3 } from 'iconsax-react';

import Tooltip from '~/components/Tooltip';
import useIsMobile from '~/hooks/useIsMobile';
import useSessionUser from '~/hooks/useSessionUser';

const GradientSettings = ({
  gradient,
  setTheme,
}: {
  gradient: boolean;
  setTheme: Dispatch<SetStateAction<Theme>>;
}) => {
  // const bg = useColorModeValue('music.100', 'music.800');
  const color = useColorModeValue('music.800', 'white');
  const currentUser = useSessionUser();
  const isSmallScreen = useIsMobile();
  const submit = useSubmit();

  const onToggle = () => {
    setTheme((prevTheme) => ({ ...prevTheme, gradient: !gradient }));
    submit(
      { gradient: `${!gradient}` },

      { method: 'post', replace: true },
    );
  };
  if (!currentUser) return null;
  return (
    <FormControl display="flex" alignItems="center" justifyContent="space-between">
      <HStack>
        {isSmallScreen && (
          <FormLabel fontSize={['sm', 'md']} htmlFor="gradient" mb="0" color={color}>
            Gradient Backround
          </FormLabel>
        )}
      </HStack>
      <Tooltip label="gradient background" hasArrow isDisabled={isSmallScreen} openDelay={300}>
        <IconButton
          aria-label="gradient background"
          icon={<ArrowDown3 />}
          onClick={onToggle}
          opacity={gradient ? 1 : 0.3}
          border={gradient ? `1px solid ${color}` : undefined}
          borderRadius="md"
        />
      </Tooltip>
    </FormControl>
  );
};

export default GradientSettings;
