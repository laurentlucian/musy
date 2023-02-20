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
  setPicker: Dispatch<SetStateAction<number | undefined>>;
  setShowSave: Dispatch<SetStateAction<boolean>>;
  showSave: boolean;
  submission: {
    gradientColorDark: string;
    gradientColorLight: string;
    playerColorDark: string;
    playerColorLight: string;
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
      setPicker(undefined);
    }
    submit(
      {
        bgGradientDark: `linear(to-t, #090808 50%, ${submission.gradientColorDark} 110%)`,
        bgGradientLight: `linear(to-t, #EEE6E2 50%, ${submission.gradientColorDark} 110%)`,
        gradientColorDark: submission.gradientColorDark,
        gradientColorLight: submission.gradientColorLight,
        playerColorDark: submission.playerColorDark + '66',
        playerColorLight: submission.playerColorLight + '66',
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

  const onReset = () => {
    if (!isSmallScreen) {
      setPicker(undefined);
    }
  };

  return (
    <Box
      bg={bg}
      w="200px"
      h="auto"
      pos="fixed"
      bottom={showSave ? 2 : '-50px'}
      right={[2, '25%']}
      zIndex={6969}
    >
      <Button onClick={onReset}>Reset</Button>
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
