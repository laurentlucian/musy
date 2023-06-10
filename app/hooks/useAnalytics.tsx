import { useEffect } from 'react';

import { posthog } from 'posthog-js';

import { isProduction } from '~/lib/utils';

import useSessionUser from './useSessionUser';

const useAnalytics = () => {
  const currentUser = useSessionUser();

  useEffect(() => {
    if (!isProduction || typeof process.env.PUBLIC_POSTHOG_KEY !== 'string') return;

    if (currentUser) {
      posthog.init(process.env.PUBLIC_POSTHOG_KEY, {
        api_host: 'https://musy.one',
      });
      posthog.identify(currentUser.userId, {
        email: currentUser.email,
        image: currentUser.image,
        name: currentUser.name,
      });
    } else {
      posthog.reset();
    }
  }, [currentUser]);

  return null;
};

export default useAnalytics;
