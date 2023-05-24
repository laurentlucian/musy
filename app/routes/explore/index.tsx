import { typedjson } from 'remix-typedjson';

import Top from '~/components/explore/Top';
import { getTopLeaderboard } from '~/services/prisma/tracks.server';

const ExploreIndex = () => {
  return <Top />;
};

export const loader = async () => {
  const top = await getTopLeaderboard();
  return typedjson({ top });
};
export { ErrorBoundary } from '~/components/error/ErrorBoundary';
export { CatchBoundary } from '~/components/error/CatchBoundary';
export default ExploreIndex;
