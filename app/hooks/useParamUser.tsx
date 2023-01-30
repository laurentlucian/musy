import { useMatches } from '@remix-run/react';

import type { Profile } from '@prisma/client';

const useParamUser = (): Profile | null => {
  const matches = useMatches();
  const route = matches.find((match) => match.id === 'routes/$id');
  if (!route || !route.data) return null;

  return route.data.user;
};

export default useParamUser;
