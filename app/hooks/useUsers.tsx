import type { Profile, Settings } from '@prisma/client';
import { useMatches } from '@remix-run/react';

const useUsers = (): (Profile & { settings: Settings | null })[] => {
  const matches = useMatches();

  // find first route with users in its data
  const route = matches.find((match) => match.data?.users);
  if (!route) return [];

  return route.data.users;
};

export default useUsers;
