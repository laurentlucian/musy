import { useTypedRouteLoaderData } from 'remix-typedjson';

import type { loader } from '~/routes/$id';

// this is more specific than useParams and don't need to null check if used properly
// or is this unnecessary?
export const useProfileId = (): string => {
  const profileId = useTypedRouteLoaderData<typeof loader>('routes/$id')?.user.userId;
  if (!profileId) {
    throw new Error("useProfileId hook must be used within '/$id' routes :)");
  }
  return profileId;
};

export const useProfile = () => {
  const profile = useTypedRouteLoaderData<typeof loader>('routes/$id');
  if (!profile) {
    throw new Error("useProfile hook must be used within '/$id' routes :)");
  }
  return profile;
};
