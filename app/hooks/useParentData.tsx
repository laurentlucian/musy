import { useMatches } from '@remix-run/react';

const useParentData = (pathname: string): unknown => {
  const matches = useMatches();
  const parent = matches.find((match) => match.pathname === pathname);
  if (!parent) return null;
  return parent.data;
};

export default useParentData;
