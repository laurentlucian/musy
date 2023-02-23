import { type Dispatch, type SetStateAction, type ReactElement, useEffect } from 'react';

import { FormControl, FormLabel, HStack, IconButton, useColorModeValue } from '@chakra-ui/react';

import type { Theme } from '@prisma/client';

import Tooltip from '~/components/Tooltip';
import useIsMobile from '~/hooks/useIsMobile';
import useSessionUser from '~/hooks/useSessionUser';

const ToggleSetting = ({
  bold,
  icon,
  label,
  setShowSave,
  setState,
  setTheme,
  themeValue,
  title,
  value,
}: {
  bold?: boolean;
  icon: ReactElement<any, string | React.JSXElementConstructor<any>> | undefined;
  label: string;
  setShowSave: Dispatch<SetStateAction<boolean>>;
  setState?: () => void;
  setTheme: Dispatch<SetStateAction<Theme>>;
  themeValue: boolean;
  title: string;
  value?: boolean;
}) => {
  const bg = useColorModeValue('music.200', 'music.800');
  const color = useColorModeValue('music.800', 'music.200');
  const currentUser = useSessionUser();
  const isSmallScreen = useIsMobile();

  const onToggle = () => {
    setShowSave(true);
    if (setState) setState();
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
    <FormControl
      display="flex"
      // alignItems="center"
      // justifyContent="space-between"
    >
      {/* <HStack>
        {isSmallScreen && (
          <FormLabel fontSize={['sm', 'md']} htmlFor={title} mb="0" color={color}>
            {title}
          </FormLabel>
        )}
      </HStack> */}
      <Tooltip label={label} hasArrow isDisabled={isSmallScreen} openDelay={300}>
        <IconButton
          aria-label={label}
          bg={bg}
          color={color}
          icon={icon}
          onClick={onToggle}
          opacity={themeValue || bold ? 1 : 0.3}
          border={themeValue || bold ? `1px solid white` : undefined} // color mode isn't working here
          borderRadius="md"
          _hover={{}} // color mode doesn't switch hover colors
        />
      </Tooltip>
    </FormControl>
  );
};

export default ToggleSetting;
