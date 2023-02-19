import { useSubmit, useTransition } from '@remix-run/react';
import { useState, type Dispatch, type SetStateAction } from 'react';

import { Button, useColorModeValue } from '@chakra-ui/react';

import Waver from '~/components/icons/Waver';

const SaveThemeButton = ({
  color,
  setShowSave,
  showSave,
  submission,
}: {
  color: string;
  setShowSave: Dispatch<SetStateAction<boolean>>;
  showSave: boolean;
  submission: { gradientColorDark: string; gradientColorLight: string };
}) => {
  const [text, setText] = useState('Save');
  const submit = useSubmit();
  const transition = useTransition();

  const bg = useColorModeValue('#EEE6E2', '#090808');

  return (
    <Button
      pos="fixed"
      bottom={showSave ? 2 : '-50px'}
      right={2}
      bg={bg}
      color={color}
      isLoading={transition.submission?.action.includes('/settings/appearance')}
      spinner={<Waver />}
      onClick={() => {
        submit(
          {
            bgGradientDark: `linear(to-t, #090808 50%, ${submission.gradientColorDark} 110%)`,
            bgGradientLight: `linear(to-t, #EEE6E2 50%, ${submission.gradientColorDark} 110%)`,
            gradientColorDark: submission.gradientColorDark,
            gradientColorLight: submission.gradientColorLight,
          },

          { method: 'post', replace: true },
        );
        setText('Saved');
        const delayExit = setTimeout(() => {
          setShowSave(false);
          setText('Save');
        }, 1000);
        return () => clearTimeout(delayExit);
      }}
      transition="bottom 0.25s"
    >
      {text}
    </Button>
  );
};

export default SaveThemeButton;

SaveThemeButton.displayName = "Save Theme Button"