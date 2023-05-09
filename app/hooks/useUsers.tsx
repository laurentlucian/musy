import { useTypedRouteLoaderData } from 'remix-typedjson';

import type { loader } from '~/root';

const useUsers = () => useTypedRouteLoaderData<typeof loader>('root')?.users ?? [];

export const useQueueableUsers = () => {
  return useTypedRouteLoaderData<typeof loader>('root')?.queueableUsers ?? [];
};

export const useRecommendableUsers = () => {
  return useTypedRouteLoaderData<typeof loader>('root')?.recommendableUsers ?? [];
};

export default useUsers;
