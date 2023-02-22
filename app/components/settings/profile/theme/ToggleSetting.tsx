import { type Dispatch, type SetStateAction, type ReactElement, useEffect } from 'react';

import { FormControl, FormLabel, HStack, IconButton, useColorModeValue } from '@chakra-ui/react';

import type { Theme } from '@prisma/client';

import Tooltip from '~/components/Tooltip';
import useIsMobile from '~/hooks/useIsMobile';
import useSessionUser from '~/hooks/useSessionUser';

const ToggleSetting = ({
  icon,
  label,
  setShowSave,
  setTheme,
  themeValue,
  title,
  value,
}: {
  icon: ReactElement<any, string | React.JSXElementConstructor<any>> | undefined;
  label: string;
  setShowSave: Dispatch<SetStateAction<boolean>>;
  setTheme: Dispatch<SetStateAction<Theme>>;
  themeValue: boolean;
  title: string;
  value?: boolean;
}) => {
  // const bg = useColorModeValue('music.100', 'music.800');
  const color = useColorModeValue('music.800', 'white');
  const currentUser = useSessionUser();
  const isSmallScreen = useIsMobile();

  const onToggle = () => {
    setShowSave(true);
    setTheme((prevTheme) => ({ ...prevTheme, [title.toLowerCase()]: !themeValue }));
  };

  useEffect(() => {
    if (value && title === 'Opaque') {
      setTheme((prevTheme) => ({ ...prevTheme, blur: false }));
    }
    if (value && title === 'Blur') {
      setTheme((prevTheme) => ({ ...prevTheme, opaque: false }));
    }
  }, [setTheme, title, value]);

  if (!currentUser) return null;
  return (
    <FormControl display="flex" alignItems="center" justifyContent="space-between">
      <HStack>
        {isSmallScreen && (
          <FormLabel fontSize={['sm', 'md']} htmlFor={title} mb="0" color={color}>
            {title}
          </FormLabel>
        )}
      </HStack>
      <Tooltip label={label} hasArrow isDisabled={isSmallScreen} openDelay={300}>
        <IconButton
          aria-label={label}
          icon={icon}
          onClick={onToggle}
          opacity={themeValue ? 1 : 0.3}
          border={themeValue ? `1px solid ${color}` : undefined}
          borderRadius="md"
        />
      </Tooltip>
    </FormControl>
  );
};

export default ToggleSetting;
