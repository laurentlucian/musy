import { useMatches } from '@remix-run/react';

const usePending = (): {
  user: {
    user: {
      bio: string | null;
      image: string;
      name: string;
      userId: string;
    } | null;
  };
}[] => {
  const matches = useMatches();

  const route = matches.find((match) => match.data?.pendingFriends);

  if (!route) return [];
  console.log(route);
  return route.data.pendingFriends;
};

export default usePending;
