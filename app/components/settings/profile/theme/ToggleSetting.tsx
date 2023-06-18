import { type Dispatch, type SetStateAction, type ReactElement, useEffect } from 'react';

import { FormControl, IconButton, useColorModeValue } from '@chakra-ui/react';

import type { Theme } from '@prisma/client';

import Tooltip from '~/components/Tooltip';
import useIsMobile from '~/hooks/useIsMobile';
import { useSetShowSave } from '~/hooks/useSaveTheme';
import useCurrentUser from '~/hooks/useCurrentUser';

const ToggleSetting = ({
  bold,
  icon,
  label,
  setState,
  setTheme,
  themeValue,
  title,
  value,
}: {
  bold?: boolean;
  icon: ReactElement<any, string | React.JSXElementConstructor<any>> | undefined;
  label: string;
  setState?: () => void;
  setTheme: Dispatch<SetStateAction<Theme>>;
  themeValue: boolean;
  title: string;
  value?: boolean;
}) => {
  const bg = useColorModeValue('musy.200', 'musy.800');
  const color = useColorModeValue('musy.800', 'musy.200');
  const currentUser = useCurrentUser();
  const isSmallScreen = useIsMobile();
  const setSave = useSetShowSave();

  const onToggle = () => {
    setSave(true);
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
    <FormControl display="flex">
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
