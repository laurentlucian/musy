import { useSubmit } from '@remix-run/react';
import type { Dispatch, SetStateAction } from 'react';

import { Box, Stack, useColorMode } from '@chakra-ui/react';

import type { Theme } from '@prisma/client';
import { ArrangeHorizontal, ArrowDown3, Blur, Eye, EyeSlash, Moon, Sun1 } from 'iconsax-react';

import ToggleSetting from './ToggleSetting';

const ToggleSettings = ({
  playerBtnSide,
  setPlayerBtnSide,
  setTheme,
  theme,
}: {
  playerBtnSide: boolean;
  setPlayerBtnSide: Dispatch<SetStateAction<boolean>>;
  setTheme: Dispatch<SetStateAction<Theme>>;
  theme: Theme;
}) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const submit = useSubmit();
  let reloadTimeout: NodeJS.Timeout;
  const toggleSettings = [
    {
      bold: true,
      icon: colorMode === 'dark' ? <Moon variant="Bold" /> : <Sun1 variant="Bold" />,
      label: 'toggle theme',
      setState: () => {
        toggleColorMode();
        // changes color mode but when navigating to new page
        // it changes color back unless you refresh before route change
        clearTimeout(reloadTimeout);
        reloadTimeout = setTimeout(() => {
          location.reload();
        }, 100);
      },
      themeValue: colorMode === 'dark',
      title: colorMode,
    },
    {
      bold: true,
      icon: playerBtnSide ? (
        <Box transform="rotateY(180deg)">
          <ArrangeHorizontal variant="TwoTone" />
        </Box>
      ) : (
        <Box transform="rotateX(180deg)">
          <ArrangeHorizontal variant="TwoTone" />
        </Box>
      ),
      label: 'player button side',
      setState: () => {
        setPlayerBtnSide(!playerBtnSide);
        submit(
          { 'player-button-side': `${playerBtnSide}` },

          { method: 'post', replace: true },
        );
      },
      themeValue: playerBtnSide,
      title: 'player button side',
    },
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
    <Stack direction={['row', 'column']}>
      {toggleSettings.map((toggleSetting, i) => (
        <ToggleSetting key={i} {...toggleSetting} setTheme={setTheme} />
      ))}
    </Stack>
  );
};

export default ToggleSettings;
