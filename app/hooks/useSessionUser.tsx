import { useMatches } from '@remix-run/react';

import type { Profile, Settings } from '@prisma/client';

const useSessionUser = ():
  | (Profile & {
      liked: { trackId: string }[];
      settings: Settings | null;
    })
  | null => {
  const matches = useMatches();
  const route = matches.find((match) => match.id === 'root');
  if (!route) return null;

  return route.data?.currentUser;
};

export default useSessionUser;
