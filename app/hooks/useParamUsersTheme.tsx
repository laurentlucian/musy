import { useMatches } from '@remix-run/react';

import type { Theme } from '@prisma/client';

const useParamUsersTheme = (): Theme | null => {
  const matches = useMatches();
  const route = matches.find((match) => match.id === 'routes/$id');
  if (!route || !route.data) return null;

  return route.data.theme;
};

export default useParamUsersTheme;
