import type { LoaderArgs } from '@remix-run/server-runtime';

import { Stack } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import Player from '~/components/profile/player/Player';
import Playlists from '~/components/tiles/playlists/Playlists';
import EditableRecommendedTiles from '~/components/tiles/TilesRecommended';
import TilesTop from '~/components/tiles/TilesTop';
import TilesTrack from '~/components/tiles/TilesTrack';
import useCurrentUser from '~/hooks/useCurrentUser';
import { getCacheControl } from '~/lib/utils';
import { prisma } from '~/services/db.server';
import { getCachedUserTop } from '~/services/prisma/spotify.server';
import { getUserLiked, getUserRecent, getUserRecommended } from '~/services/prisma/tracks.server';
import { getUserProfile } from '~/services/prisma/users.server';
import { getUserPlaylists } from '~/services/spotify.server';

const ProfileOutlet = () => {
  const { liked, party, playback, playlists, recent, recommended, top, user } =
    useTypedLoaderData<typeof loader>();
  const currentUser = useCurrentUser();
  const isOwnProfile = currentUser?.userId === user.userId;

  return (
    <Stack spacing={8} pos="relative">
      {playback && (
        <Player
          layoutKey="Player"
          id={user.userId}
          party={party}
          playback={playback}
          name={user.name}
        />
      )}

      {isOwnProfile && <EditableRecommendedTiles tracks={recommended} />}
      {!isOwnProfile && <TilesTrack tracks={recommended} title="RECOMMENDED" />}

      <TilesTrack tracks={recent} title="RECENT" />
      <TilesTrack tracks={liked} title="LIKED" />
      <TilesTop tracks={top} />
      <Playlists playlists={playlists} />
    </Stack>
  );
};

export const loader = async ({ params, request }: LoaderArgs) => {
  const id = params.id;
  invariant(id, 'Missing params Id');

  const [{ playback, ...user }, recommended, recent, liked, party, top, playlists] =
    await Promise.all([
      getUserProfile(id),
      getUserRecommended(id).catch(() => []),
      getUserRecent(id).catch(() => []),
      getUserLiked(id).catch(() => []),
      prisma.party.findMany({ where: { ownerId: id } }),
      getCachedUserTop(id, new URL(request.url)),
      getUserPlaylists(id),
    ]);

  return typedjson(
    { liked, party, playback, playlists, recent, recommended, top, user },
    {
      headers: {
        ...getCacheControl(),
      },
    },
  );
};

export { ErrorBoundary } from '~/components/error/ErrorBoundary';
export default ProfileOutlet;
