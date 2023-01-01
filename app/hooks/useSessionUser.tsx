import type { Profile, Settings } from '@prisma/client';
import { useMatches } from '@remix-run/react';

const useSessionUser = ():
  | (Profile & {
      settings: Settings | null;
      liked: { trackId: string }[];
    })
  | null => {
  const matches = useMatches();
  const route = matches.find((match) => match.id === 'root');
  if (!route) return null;

  return route.data.currentUser;
};

export default useSessionUser;
