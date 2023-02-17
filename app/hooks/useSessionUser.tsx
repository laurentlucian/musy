import { useMatches } from '@remix-run/react';

import type { Profile, Settings, Theme, Track } from '@prisma/client';

const useSessionUser = ():
  | (Profile & {
      liked: { trackId: string }[];
      settings: (Settings & { profileSong: Track }) | null;
      theme: Theme | null;
    })
  | null => {
  const matches = useMatches();
  const route = matches.find((match) => match.id === 'root');
  if (!route) return null;

  return route.data?.currentUser;
};

export default useSessionUser;
