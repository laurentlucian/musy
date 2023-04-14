import { useMatches } from '@remix-run/react';

import type { Friends, Profile, Settings, Track } from '@prisma/client';

const useSessionUser = ():
  | (Profile & {
      friends: Friends[];
      liked: { trackId: string }[];
      settings: (Settings & { profileSong: Track }) | null;
    })
  | null => {
  const matches = useMatches();
  const route = matches.find((match) => match.id === 'root');
  if (!route) return null;

  return route.data?.currentUser;
};

export default useSessionUser;
