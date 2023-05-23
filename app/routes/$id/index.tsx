import type { LoaderArgs } from '@remix-run/server-runtime';

import { Stack } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import Player from '~/components/profile/player/Player';
import Playlists from '~/components/profile/tiles/playlists/Playlists';
import TrackTiles from '~/components/profile/tiles/TrackTiles';
import { prisma } from '~/services/db.server';
import { getCachedUserTop } from '~/services/prisma/spotify.server';
import { getUserLiked, getUserRecent, getUserRecommended } from '~/services/prisma/tracks.server';
import { getUserProfile } from '~/services/prisma/users.server';
import { getUserPlaylists } from '~/services/spotify.server';

const ProfileOutlet = () => {
  const { liked, party, playback, playlists, recent, recommended, top, user } =
    useTypedLoaderData<typeof loader>();

  return (
    <Stack spacing={5} pos="relative" top={playback ? '-30px' : 0}>
      {playback && (
        <Player
          layoutKey="Player"
          id={user.userId}
          party={party}
          playback={playback}
          name={user.name}
        />
      )}
      <TrackTiles tracks={recommended} title="Recommended" />
      <TrackTiles tracks={recent} title="Recent" />
      <TrackTiles tracks={liked} title="Liked" />
      <TrackTiles tracks={top} title="Top" />
      <Playlists playlists={playlists} />
    </Stack>
  );
};

export const loader = async ({ params, request }: LoaderArgs) => {
  const id = params.id;
  invariant(id, 'Missing params Id');

  const { playback, ...user } = await getUserProfile(id);

  const [recommended, recent, liked, party, top, playlists] = await Promise.all([
    getUserRecommended(id).catch(() => []),
    getUserRecent(id).catch(() => []),
    getUserLiked(id).catch(() => []),
    prisma.party.findMany({ where: { ownerId: id } }),
    getCachedUserTop(id, new URL(request.url)),
    getUserPlaylists(id),
  ]);

  return typedjson({ liked, party, playback, playlists, recent, recommended, top, user });
};

export default ProfileOutlet;
