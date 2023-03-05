// import type { LoaderArgs } from '@remix-run/server-runtime';

import { Stack, useColorModeValue } from '@chakra-ui/react';

import type { Profile } from '@prisma/client';
import { typedjson } from 'remix-typedjson';

import SearchInput from '~/components/explore/SearchInput';
import Top from '~/components/explore/Top';
// import SessionTile from '~/components/sessions/SessionTile';
import Tile from '~/components/Tile';
import UserTile from '~/components/UserTile';
import { useSearch } from '~/hooks/useSearch';
import { getAllUsers } from '~/services/auth.server';
import { prisma } from '~/services/db.server';

const Explore = () => {
  const { data, search, setSearch, setTracks, tracks } = useSearch();
  const bg = useColorModeValue('#EEE6E2', '#050404');

  return (
    <Stack bg={bg} alignItems="center" h="100%">
      <SearchInput search={search} setSearch={setSearch} setTracks={setTracks} />
      <Stack pt="50px" overflowY="scroll" w="100%" h="91vh">
        {data?.users.map((user: Profile) => (
          <UserTile key={user.id} profile={user} />
        ))}
        {tracks?.map((track, index) => (
          <Tile
            key={track.id}
            layoutKey={'Explore' + index}
            track={track}
            tracks={tracks}
            index={index}
            list
          />
        ))}

        {!search ? <Top tracks={tracks} /> : null}
      </Stack>
    </Stack>
  );
};

export const loader = async () => {
  const users = await getAllUsers();
  const SEVEN_DAYS = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);
  const trackIds = await prisma.recentSongs.groupBy({
    by: ['trackId'],
    orderBy: { _count: { trackId: 'desc' } },
    take: 10,
    where: { playedAt: { gte: SEVEN_DAYS } },
  });

  const top = await prisma.track.findMany({
    where: { id: { in: trackIds.map((t) => t.trackId) } },
  });

  top.sort((a, b) => {
    const aIndex = trackIds.findIndex((t) => t.trackId === a.id);
    const bIndex = trackIds.findIndex((t) => t.trackId === b.id);
    return aIndex - bIndex;
  });

  return typedjson({ top, users });
};
export { ErrorBoundary } from '~/components/error/ErrorBoundary';
export { CatchBoundary } from '~/components/error/CatchBoundary';

export default Explore;
