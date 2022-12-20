import { useMatches } from '@remix-run/react';

const useIsMobile = (): boolean => {
  const matches = useMatches();
  const route = matches.find((match) => match.id === 'root');
  if (!route) return false;

  return route.data.isMobile;
};

export default useIsMobile;
