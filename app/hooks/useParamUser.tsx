import type { Profile } from '@prisma/client';
import { useMatches } from '@remix-run/react';

const useParamUser = (): Profile | null => {
  const matches = useMatches();
  const route = matches.find((match) => match.id === 'routes/$id');
  if (!route) return null;

  return route.data.user;
};

export default useParamUser;
