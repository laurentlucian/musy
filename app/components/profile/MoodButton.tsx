import { useSubmit, useTransition } from '@remix-run/react';

import { IconButton } from '@chakra-ui/react';

import { Smileys } from 'iconsax-react';

import Tooltip from '../Tooltip';

const MoodButton = () => {
  const submit = useSubmit();
  const transition = useTransition();
  const isLoading = transition.submission?.formData.get('mood') === 'true';

  return (
    <Tooltip label="get mood">
      <IconButton
        color="music.400"
        aria-label="get mood"
        icon={<Smileys />}
        variant="ghost"
        cursor="pointer"
        isLoading={isLoading}
        onClick={() => submit({ mood: 'true' }, { method: 'post', replace: true })}
      />
    </Tooltip>
  );
};

export default MoodButton;
