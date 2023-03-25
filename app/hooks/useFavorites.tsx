import { useMatches } from '@remix-run/react';

import type { Playback, Profile, Settings, Track } from '@prisma/client';

const useFavorites = (): (Profile & {
  playback:
    | (Playback & {
        track: Track & {
          liked: {
            user: Profile;
          }[];
          recent: {
            user: Profile;
          }[];
        };
      })
    | null;
  settings: Settings | null;
})[] => {
  const matches = useMatches();

  // find first friends with users in its data
  const route = matches.find((match) => match.data?.favorites);
  if (!route) return [];

  return route.data.favorites;
};

export default useFavorites;
