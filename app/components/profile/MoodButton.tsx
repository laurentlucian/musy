import { useSubmit, useTransition } from '@remix-run/react';

import { Button, Text } from '@chakra-ui/react';

import { Smileys } from 'iconsax-react';

import Tooltip from '../Tooltip';
import { timePassed } from '~/lib/utils';

const MoodButton = ({ mood, since }: { mood?: string | null; since?: Date }) => {
  const submit = useSubmit();
  const transition = useTransition();
  const isLoading = transition.submission?.formData.get('mood') === 'true';

  return (
    <Tooltip label="get mood ;)">
      <Button
        color="music.400"
        aria-label="get mood"
        rightIcon={mood ? undefined : <Smileys />}
        variant="ghost"
        cursor="pointer"
        isLoading={isLoading}
        onClick={() => submit({ mood: 'true' }, { method: 'post', replace: true })}
        fontSize="14px"
        p={0}
        _hover={{ boxShadow: 'none' }}
      >
        {mood ? mood : 'get mood'}
        <Text as="span" fontSize="12px" opacity={0.5} pl={2}>
          {timePassed(since ?? null)}
        </Text>
      </Button>
    </Tooltip>
  );
};

export default MoodButton;
