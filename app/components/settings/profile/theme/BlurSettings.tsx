import { useSubmit } from '@remix-run/react';
import type { Dispatch, SetStateAction } from 'react';

import { FormControl, FormLabel, HStack, IconButton, useColorModeValue } from '@chakra-ui/react';

import type { Theme } from '@prisma/client';
import { ArrowDown3 } from 'iconsax-react';

import Tooltip from '~/components/Tooltip';
import useIsMobile from '~/hooks/useIsMobile';
import useSessionUser from '~/hooks/useSessionUser';

const BlurSettings = ({
  blur,
  setTheme,
}: {
  blur: boolean;
  setTheme: Dispatch<SetStateAction<Theme>>;
}) => {
  // const bg = useColorModeValue('music.100', 'music.800');
  const color = useColorModeValue('music.800', 'white');
  const currentUser = useSessionUser();
  const isSmallScreen = useIsMobile();
  const submit = useSubmit();

  const onToggle = () => {
    setTheme((prevTheme) => ({ ...prevTheme, blur: !blur }));
    submit(
      { blur: `${!blur}` },

      { method: 'post', replace: true },
    );
  };
  if (!currentUser) return null;
  return (
    <FormControl display="flex" alignItems="center" justifyContent="space-between">
      <HStack>
        {isSmallScreen && (
          <FormLabel fontSize={['sm', 'md']} htmlFor="blur" mb="0" color={color}>
            Blur
          </FormLabel>
        )}
      </HStack>
      <Tooltip label="blur player" hasArrow isDisabled={isSmallScreen} openDelay={300}>
        <IconButton
          aria-label="blur player"
          icon={<ArrowDown3 />}
          onClick={onToggle}
          opacity={blur ? 1 : 0.3}
          border={blur ? `1px solid ${color}` : undefined}
          borderRadius="md"
        />
      </Tooltip>
    </FormControl>
  );
};

export default BlurSettings;
