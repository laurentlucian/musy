import { useSubmit, useTransition } from '@remix-run/react';

import { Button, Stack, Text } from '@chakra-ui/react';

import { Smileys } from 'iconsax-react';

import useIsMobile from '~/hooks/useIsMobile';
import { timeSince } from '~/lib/utils';

import Waver from '../icons/Waver';
import Tooltip from '../Tooltip';

const MoodButton = ({ mood, since }: { mood?: string | null; since?: Date }) => {
  const submit = useSubmit();
  const transition = useTransition();
  const isLoading = transition.submission?.formData.get('mood') === 'true';
  const label = mood ? 'refresh mood' : 'get mood ;)';
  const icon = mood ? undefined : <Smileys />;
  const text = mood ? mood : 'get mood';
  const timePassed = timeSince(since ?? null, 'minimal');
  const isSmallScreen = useIsMobile();

  return (
    <Tooltip label={label} placement="bottom-end" hasArrow isDisabled={isSmallScreen}>
      <Button
        aria-label="get mood"
        rightIcon={icon}
        variant="unstyled"
        cursor="pointer"
        isLoading={isLoading}
        spinner={
          <Stack ml="20px">
            <Waver />
          </Stack>
        }
        onClick={() => submit({ mood: 'true' }, { method: 'post', replace: true })}
        fontSize="14px"
        p={0}
      >
        {text}
        <Text as="span" fontSize="11px" opacity={0.5} pl={2}>
          {timePassed}
        </Text>
      </Button>
    </Tooltip>
  );
};

export default MoodButton;
