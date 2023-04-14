import { useMatches } from '@remix-run/react';

import type { Theme } from '@prisma/client';

const useSessionUsersTheme = (): Theme | null => {
  const matches = useMatches();
  const route = matches.find((match) => match.id === 'root');
  if (!route) return null;

  return route.data?.theme;
};

export default useSessionUsersTheme;
