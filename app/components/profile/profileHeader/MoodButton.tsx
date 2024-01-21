import { useParams } from '@remix-run/react';
import { Fragment, useEffect } from 'react';

import { useTypedFetcher } from 'remix-typedjson';

import useIsMobile from '~/hooks/useIsMobile';
import Waver from '~/lib/icons/Waver';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/lib/ui/tooltip';
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
    <Tooltip disableHoverableContent={isSmallScreen}>
      <TooltipContent>{label}</TooltipContent>
      <TooltipTrigger aria-label='get mood' onClick={getMood}>
        <Fragment>
          {isLoading && <Waver />}
          {!isLoading && (
            <p className='text-[10px] md:text-[13px]'>
              {text}
              <span className='pl-1 text-[9px] opacity-50 md:text-[10px]'>{timePassed}</span>
            </p>
          )}
        </Fragment>
      </TooltipTrigger>
    </Tooltip>
  );
};

export default MoodButton;
