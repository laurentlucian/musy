import { useSubmit, useTransition } from '@remix-run/react';
import { useState, type Dispatch, type SetStateAction } from 'react';

import { Box, Button, useColorModeValue } from '@chakra-ui/react';

import type { Theme } from '@prisma/client';

import Waver from '~/components/icons/Waver';
import useIsMobile from '~/hooks/useIsMobile';

const SaveThemeButton = ({
  color,
  playerBtnSide,
  setPicker,
  setShowSave,
  showSave,
  theme,
}: {
  color: string;
  playerBtnSide: boolean;
  setPicker: Dispatch<SetStateAction<number>>;
  setShowSave: Dispatch<SetStateAction<boolean>>;
  showSave: boolean;
  theme: Theme;
}) => {
  const [text, setText] = useState('Save');
  const submit = useSubmit();
  const transition = useTransition();
  const isSmallScreen = useIsMobile();
  const isLoading = transition.submission?.action.includes('/settings/appearance');
  const bg = useColorModeValue('#EEE6E2', '#090808');

  const onSave = () => {
    if (!isSmallScreen) {
      setPicker(-1);
    }
    submit(
      {
        backgroundDark: theme.backgroundDark,
        backgroundLight: theme.backgroundLight,
        bgGradientDark: `linear(to-t, #090808 50%, ${theme.gradientColorDark} 110%)`,
        bgGradientLight: `linear(to-t, #EEE6E2 50%, ${theme.gradientColorLight} 110%)`,
        blur: `${theme.blur}`,
        gradient: `${theme.gradient}`,
        gradientColorDark: theme.gradientColorDark,
        gradientColorLight: theme.gradientColorLight,
        mainTextDark: theme.mainTextDark,
        mainTextLight: theme.mainTextLight,
        opaque: `${theme.opaque}`,
        playerButtonSide: `${playerBtnSide}`,
        playerColorDark: theme.playerColorDark,
        playerColorLight: theme.playerColorLight,
        subTextDark: theme.subTextDark,
        subTextLight: theme.subTextLight,
      },

      { method: 'post', replace: true },
    );
    setText('Saved');
    const delayExit = setTimeout(() => {
      setShowSave(false);
      setText('Save');
    }, 1000);
    return () => clearTimeout(delayExit);
  };

  // const onReset = () => {
  //   if (!isSmallScreen) {
  //     setPicker(undefined);
  //   }
  // };

  return (
    <Box
      bg={bg}
      // w="200px"
      h="auto"
      pos="fixed"
      bottom={showSave ? 2 : '-50px'}
      right={[2, '25%']}
      zIndex={6969}
    >
      {/* <Button onClick={onReset}>Reset</Button> */}
      <Button
        bg={bg}
        color={color}
        isLoading={isLoading}
        spinner={<Waver />}
        onClick={onSave}
        transition="bottom 0.25s"
      >
        {text}
      </Button>
    </Box>
  );
};

export default SaveThemeButton;

SaveThemeButton.displayName = 'Save Theme Button';
