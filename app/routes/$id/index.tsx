import type { LoaderArgs } from '@remix-run/server-runtime';

import { Stack } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import Player from '~/components/profile/player/Player';
import LikedTracks from '~/components/profile/tiles/LikedTracks';
import Playlists from '~/components/profile/tiles/playlists/Playlists';
import RecentTracks from '~/components/profile/tiles/RecentTracks';
import Recommended from '~/components/profile/tiles/recommend/Recommended';
import TopTracks from '~/components/profile/tiles/TopTracks';
import { prisma } from '~/services/db.server';
import { getUserLiked, getUserRecent, getUserRecommended } from '~/services/prisma/tracks.server';
import { getUserProfile } from '~/services/prisma/users.server';
import { getUserPlaylists, getUserTop } from '~/services/spotify.server';

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
      <Recommended recommended={recommended} />
      <RecentTracks recent={recent} />
      <LikedTracks liked={liked} />
      <TopTracks top={top} />
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
    getUserTop(id, new URL(request.url)),
    getUserPlaylists(id),
  ]);

  return typedjson({ liked, party, playback, playlists, recent, recommended, top, user });
};

export default ProfileOutlet;
