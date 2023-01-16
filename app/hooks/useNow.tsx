import { useMatches } from '@remix-run/react';

const useNow = () => {
  const matches = useMatches();
  const route = matches.find((match) => match.data?.now);
  if (!route || !route.data) return 0;
  return route.data.now;
};

export default useNow;
