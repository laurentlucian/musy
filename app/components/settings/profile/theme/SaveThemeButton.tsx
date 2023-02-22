import { useSubmit, useTransition } from '@remix-run/react';
import { useState, type Dispatch, type SetStateAction } from 'react';

import { Box, Button, useColorModeValue } from '@chakra-ui/react';

import Waver from '~/components/icons/Waver';
import useIsMobile from '~/hooks/useIsMobile';

const SaveThemeButton = ({
  color,
  setPicker,
  setShowSave,
  showSave,
  submission,
}: {
  color: string;
  setPicker: Dispatch<SetStateAction<number>>;
  setShowSave: Dispatch<SetStateAction<boolean>>;
  showSave: boolean;
  submission: {
    backgroundDark: string;
    backgroundLight: string;
    blur: boolean;
    gradient: boolean;
    gradientColorDark: string;
    gradientColorLight: string;
    mainTextDark: string;
    mainTextLight: string;
    opaque: boolean;
    playerColorDark: string;
    playerColorLight: string;
    subTextDark: string;
    subTextLight: string;
  };
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
        backgroundDark: submission.backgroundDark,
        backgroundLight: submission.backgroundLight,
        bgGradientDark: `linear(to-t, #090808 50%, ${submission.gradientColorDark} 110%)`,
        bgGradientLight: `linear(to-t, #EEE6E2 50%, ${submission.gradientColorDark} 110%)`,
        blur: `${submission.blur}`,
        gradient: `${submission.gradient}`,
        gradientColorDark: submission.gradientColorDark,
        gradientColorLight: submission.gradientColorLight,
        mainTextDark: submission.mainTextDark,
        mainTextLight: submission.mainTextLight,
        opaque: `${submission.opaque}`,
        playerColorDark: submission.playerColorDark,
        playerColorLight: submission.playerColorLight,
        subTextDark: submission.subTextDark,
        subTextLight: submission.subTextLight,
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
