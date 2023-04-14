import { useMatches } from '@remix-run/react';

import type { Profile, Settings, Track } from '@prisma/client';

const useParamUser = ():
  | (Profile & {
      liked: { trackId: string }[];
      settings: (Settings & { profileSong: Track }) | null;
    })
  | null => {
  const matches = useMatches();
  const route = matches.find((match) => match.id === 'routes/$id');
  if (!route || !route.data) return null;

  return route.data.user;
};

export default useParamUser;
