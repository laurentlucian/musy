import type { Profile } from '@prisma/client';
import { useMatches } from '@remix-run/react';
const useUsers = (): Profile[] => {
  const matches = useMatches();
  const route = matches.find((match) => match.id === 'routes/index');
  if (!route) {
    const route = matches.find((match) => match.id === 'routes/$id');
    if (!route) return [];

    return route.data.users;
  }

  return route.data.users;
};

export default useUsers;
