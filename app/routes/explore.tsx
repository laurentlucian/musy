// import type { LoaderArgs } from '@remix-run/server-runtime';

import { Outlet } from '@remix-run/react';

import { Stack, useColorModeValue } from '@chakra-ui/react';

// import { typedjson } from 'remix-typedjson';

// import type { Profile } from '@prisma/client';

import SearchInput from '~/components/explore/SearchInput';
// import SessionTile from '~/components/sessions/SessionTile';
import Tile from '~/components/Tile';
// import UserTile from '~/components/UserTile';
import { useExplore } from '~/hooks/useExplore';
// import { getAllUsers } from '~/services/auth.server';

const Explore = () => {
  const { search, setSearch, setTracks, tracks } = useExplore();
  // const { pathname } = useLocation();
  const bg = useColorModeValue('#EEE6E2', '#050404');

  return (
    <Stack bg={bg} alignItems="center" h="100%">
      <SearchInput search={search} setSearch={setSearch} setTracks={setTracks} />
      <Stack w={['100%', ' 500px']} h={['89vh', '100%']} overflowY="scroll">
        {/* {!pathname.includes('/explore/') &&
          data?.users.map((user: Profile) => <UserTile key={user.id} profile={user} />)} */}
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

        {!search ? <Outlet /> : null}
      </Stack>
    </Stack>
  );
};

// export const loader = async () => {
//   const users = await getAllUsers();

//   return typedjson({ users });
// };
export { ErrorBoundary } from '~/components/error/ErrorBoundary';
export { CatchBoundary } from '~/components/error/CatchBoundary';

export default Explore;
