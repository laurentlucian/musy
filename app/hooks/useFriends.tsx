import { useMatches } from '@remix-run/react';

import type { Playback, Profile, Settings, Track } from '@prisma/client';

const useFriends = (): (Profile & {
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

  // find first route with users in its data
  const route = matches.find((match) => match.data?.friends);
  if (!route) return [];

  return route.data.friends;
};

export default useFriends;
