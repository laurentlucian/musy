import { typedjson } from 'remix-typedjson';

import Top from '~/components/explore/Top';
import { prisma } from '~/services/db.server';

const ExploreIndex = () => {
  return <Top />;
};
export const loader = async () => {
  const SEVEN_DAYS = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);
  const trackIds = await prisma.recentSongs.groupBy({
    by: ['trackId'],
    orderBy: { _count: { trackId: 'desc' } },
    take: 10,
    where: { playedAt: { gte: SEVEN_DAYS } },
  });

  const top = await prisma.track.findMany({
    include: {
      _count: {
        select: { recent: true },
      },
      liked: {
        include: {
          user: true,
        },
      },
    },
    where: { id: { in: trackIds.map((t) => t.trackId) } },
  });

  top.sort((a, b) => {
    const aIndex = trackIds.findIndex((t) => t.trackId === a.id);
    const bIndex = trackIds.findIndex((t) => t.trackId === b.id);
    return aIndex - bIndex;
  });

  return typedjson({ top });
};
export { ErrorBoundary } from '~/components/error/ErrorBoundary';
export { CatchBoundary } from '~/components/error/CatchBoundary';
export default ExploreIndex;
