import { type Dispatch, type SetStateAction, type ReactElement, useEffect } from 'react';

import type { Theme } from '@prisma/client';

import useCurrentUser from '~/hooks/useCurrentUser';
import useIsMobile from '~/hooks/useIsMobile';
import { useSetShowSave } from '~/hooks/useSaveTheme';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/lib/ui/tooltip';

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
  const currentUser = useCurrentUser();
  const isSmallScreen = useIsMobile();
  const setSave = useSetShowSave();

  const onToggle = () => {
    setSave(true);
    if (setState) setState();
    setTheme((prevTheme) => ({
      ...prevTheme,
      [title.toLowerCase()]: !themeValue,
    }));
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
    <Tooltip disableHoverableContent={isSmallScreen}>
      <TooltipTrigger>
        <button
          aria-label={label}
          onClick={onToggle}
          // opacity={themeValue || bold ? 1 : 0.3}
          // border={themeValue || bold ? `1px solid white` : undefined} // color mode isn't working here
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
};

export default ToggleSetting;
