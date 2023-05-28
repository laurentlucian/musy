import { useNavigation, useParams } from '@remix-run/react';

import { Button, Stack, Text } from '@chakra-ui/react';

import { Smileys } from 'iconsax-react';
import { useTypedFetcher } from 'remix-typedjson';

import Tooltip from '~/components/Tooltip';
import useIsMobile from '~/hooks/useIsMobile';
import Waver from '~/lib/icons/Waver';
import { timeSince } from '~/lib/utils';
import type { action as moodAction } from '~/routes/api/user/profile/mood';

const MoodButton = ({ mood, since }: { mood?: string | null; since?: Date }) => {
  const fetcher = useTypedFetcher<typeof moodAction>();
  const transition = useNavigation();
  const { id } = useParams();
  const isLoading = transition.formData?.get('mood') === 'true';
  const label = mood ? 'refresh mood' : 'get mood ;)';
  const icon = mood ? undefined : <Smileys />;
  const text = mood ? mood : 'get mood';
  const timePassed = timeSince(since ?? null, 'minimal');
  const isSmallScreen = useIsMobile();

  const getMood = () => {
    fetcher.submit({ userId: id ?? ':(' }, { action: '/api/user/profile/mood', replace: true });
  };

  return (
    <Tooltip label={label} placement="bottom-end" hasArrow isDisabled={isSmallScreen}>
      <Button
        aria-label="get mood"
        rightIcon={icon}
        variant="unstyled"
        cursor="pointer"
        isLoading={isLoading}
        spinner={
          <Stack ml="15px">
            <Waver />
          </Stack>
        }
        onClick={getMood}
        fontSize={['10px', '13px']}
        p={0}
        h="-webkit-fit-content"
      >
        {text}
        <Text as="span" fontSize={['9px', '10px']} opacity={0.5} pl={1.5}>
          {timePassed}
        </Text>
      </Button>
    </Tooltip>
  );
};

export default MoodButton;
