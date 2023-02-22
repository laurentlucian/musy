import type { Dispatch, SetStateAction } from 'react';

import type { Theme } from '@prisma/client';
import { ArrowDown3, Blur, Eye, EyeSlash } from 'iconsax-react';

import ToggleSetting from './ToggleSetting';

const ToggleSettings = ({
  setShowSave,
  setTheme,
  theme,
}: {
  setShowSave: Dispatch<SetStateAction<boolean>>;
  setTheme: Dispatch<SetStateAction<Theme>>;
  theme: Theme;
}) => {
  const toggleSettings = [
    {
      icon: <ArrowDown3 />,
      label: 'gradient background',
      themeValue: theme.gradient,
      title: 'Gradient',
    },
    {
      icon: theme.opaque ? <EyeSlash /> : <Eye />,
      label: 'opaque player',
      themeValue: theme.opaque,
      title: 'Opaque',
      value: theme.opaque,
    },
    {
      icon: <Blur />,
      label: 'blur player',
      themeValue: theme.blur,
      title: 'Blur',
      value: theme.blur,
    },
  ];

  return (
    <>
      {toggleSettings.map((toggleSetting, i) => (
        <ToggleSetting key={i} {...toggleSetting} setShowSave={setShowSave} setTheme={setTheme} />
      ))}
    </>
  );
};

export default ToggleSettings;
