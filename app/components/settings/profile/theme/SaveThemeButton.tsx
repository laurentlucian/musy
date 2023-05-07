import { useSubmit, useTransition } from '@remix-run/react';
import { useState, type Dispatch, type SetStateAction } from 'react';

import { Button, HStack, Text } from '@chakra-ui/react';

import type { Theme } from '@prisma/client';
import { AnimatePresence } from 'framer-motion';

import Waver from '~/lib/icons/Waver';
import useIsMobile from '~/hooks/useIsMobile';
import { useSaveState, useSetShowSave, useAlertState } from '~/hooks/useSave';
import useSessionUser from '~/hooks/useSessionUser';

const SaveThemeButton = ({
  color,
  playerBtnSide,
  setPicker,
  setTheme,
  theme,
}: {
  color: string;
  playerBtnSide: boolean;
  setPicker: Dispatch<SetStateAction<number>>;
  setTheme: Dispatch<SetStateAction<Theme>>;
  theme: Theme;
}) => {
  const [text, setText] = useState('Save');
  const currentUser = useSessionUser();
  const submit = useSubmit();
  const transition = useTransition();
  const isSmallScreen = useIsMobile();
  const isLoading = transition.submission?.action.includes('/settings/appearance');
  const alert = useAlertState();
  const bg = '#313338';
  const setSave = useSetShowSave();
  const show = useSaveState();

  const onSave = () => {
    if (!isSmallScreen) {
      setPicker(-1);
    }
    submit(
      {
        backgroundDark: theme.backgroundDark,
        backgroundLight: theme.backgroundLight,
        bgGradientDark: `linear(to-t, #090808 50%, ${theme.backgroundDark} 110%)`,
        bgGradientLight: `linear(to-t, #EEE6E2 50%, ${theme.backgroundLight} 110%)`,
        blur: `${theme.blur}`,
        gradient: `${theme.gradient}`,
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
      setSave(false);
      setText('Save');
    }, 1000);
    return () => clearTimeout(delayExit);
  };

  const onReset = () => {
    setPicker(-1);
    setSave(false);
    setTheme(
      theme ?? {
        backgroundDark: '#090808',
        backgroundLight: '#EEE6E2',
        bgGradientDark: 'linear(to-t, #090808 50%, #fcbde2 110%)',
        bgGradientLight: 'linear(to-t, #EEE6E2 50%, #fcbde2 110%)',
        blur: true,
        customPlayer: null,
        gradient: false,
        isPreset: true,
        mainTextDark: '#EEE6E2',
        mainTextLight: '#161616',
        musyLogo: 'musy',
        opaque: false,
        playerColorDark: '#101010',
        playerColorLight: '#E7DFD9',
        subTextDark: '#EEE6E2',
        subTextLight: '#161616',
        userId: currentUser?.userId ?? '',
        version: 0,
      },
    );
  };

  return (
    <AnimatePresence>
      {show && (
        <HStack
          bg={alert ? 'red' : bg}
          w={['95%', '100%']}
          h="50px"
          zIndex={6969}
          justify="space-around"
          borderRadius="10px"
          pos={['fixed', 'unset']}
          bottom={5}
          alignSelf="center"
        >
          <Text color="white">Reset or Save changes</Text>
          <HStack>
            <Button variant="ghost" onClick={onReset}>
              Reset
            </Button>
            <Button
              bg="green"
              color={color}
              isLoading={isLoading}
              spinner={<Waver />}
              onClick={onSave}
            >
              {text}
            </Button>
          </HStack>
        </HStack>
      )}
    </AnimatePresence>
  );
};

export default SaveThemeButton;

SaveThemeButton.displayName = 'Save Theme Button';
