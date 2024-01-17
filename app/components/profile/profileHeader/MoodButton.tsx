import { useParams } from '@remix-run/react';
import { Fragment, useEffect } from 'react';

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
    <Tooltip label={label} placement='bottom-end' hasArrow isDisabled={isSmallScreen}>
      <Fragment>
        {isLoading && <Waver />}
        {!isLoading && (
          <button
            className='flex h-fit cursor-pointer items-center justify-center p-0 text-[10px] md:text-[13px]'
            aria-label='get mood'
            onClick={getMood}
          >
            {text}
            <span className='pl-1 text-[9px] opacity-50 md:text-[10px]'>{timePassed}</span>
          </button>
        )}
      </Fragment>
    </Tooltip>
  );
};

export default MoodButton;
