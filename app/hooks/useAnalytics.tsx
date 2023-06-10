import { useEffect } from 'react';

import { posthog } from 'posthog-js';
import { useTypedRouteLoaderData } from 'remix-typedjson';

import { isProduction } from '~/lib/utils';
import type { loader } from '~/root';

import useSessionUser from './useSessionUser';

const useAnalytics = () => {
  const ENV = useTypedRouteLoaderData<typeof loader>('root')?.ENV;
  const currentUser = useSessionUser();

  useEffect(() => {
    if (!isProduction || typeof ENV?.PUBLIC_POSTHOG_KEY !== 'string') return;

    if (currentUser) {
      posthog.init(ENV.PUBLIC_POSTHOG_KEY, {
        api_host: 'https://app.posthog.com',
      });
      posthog.identify(currentUser.userId, {
        email: currentUser.name, // better identification with name
      });
    } else {
      posthog.reset();
    }
  }, [currentUser, ENV]);

  return null;
};

export default useAnalytics;
