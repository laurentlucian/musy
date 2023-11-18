import { useParams } from '@remix-run/react';
import { useEffect } from 'react';

import { Button, Text } from '@chakra-ui/react';

import { useTypedFetcher } from 'remix-typedjson';

import Tooltip from '~/components/Tooltip';
import useIsMobile from '~/hooks/useIsMobile';
import Waver from '~/lib/icons/Waver';
import { timeSince } from '~/lib/utils';
import type { action as moodAction } from '~/routes/api+/user+/profile+/mood';

const MoodButton = ({ mood, since }: { mood?: string | null; since?: Date }) => {
  const fetcher = useTypedFetcher<typeof moodAction>();
  const params = useParams();
  const timePassed = timeSince(since ?? null, 'minimal');
  const isSmallScreen = useIsMobile();

  const text = mood ? mood : 'get mood';

  const isLoading = fetcher.formAction === '/api/user/profile/mood';
  const label = isLoading ? 'refreshing..' : mood ? 'refresh mood' : 'get mood ;)';
  const userId = params.id as string;
  const getMood = () => {
    fetcher.submit({ userId }, { action: '/api/user/profile/mood', method: 'POST' });
  };

  useEffect(() => {
    if (!mood && !isLoading) {
      getMood();
    }
  }, [mood]);

  return (
    <Tooltip label={label} placement="bottom-end" hasArrow isDisabled={isSmallScreen}>
      <Button
        aria-label="get mood"
        variant="unstyled"
        cursor="pointer"
        display="flex"
        justifyItems="center"
        isLoading={isLoading}
        spinner={<Waver />}
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
