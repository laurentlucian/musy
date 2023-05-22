import type { LoaderArgs } from '@remix-run/server-runtime';

import { Stack } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import PlayerPrisma from '~/components/profile/player/PlayerPrisma';
import LikedTracksPrisma from '~/components/profile/tiles/LikedTracksPrisma';
import Playlists from '~/components/profile/tiles/playlists/Playlists';
import RecentTracksPrisma from '~/components/profile/tiles/RecentTracksPrisma';
import Recommended from '~/components/profile/tiles/recommend/Recommended';
import TopTracks from '~/components/profile/tiles/TopTracks';
import { prisma } from '~/services/db.server';
import { getUserLiked, getUserRecent, getUserRecommended } from '~/services/prisma/tracks.server';
import { getUserProfile } from '~/services/prisma/users.server';
import { getUserPlaylists, getUserTop } from '~/services/spotify.server';

const ProfilePrismaOutlet = () => {
  const { liked, party, playback, playlists, recent, recommended, top, user } =
    useTypedLoaderData<typeof loader>();

  return (
    <Stack spacing={5} pos="relative" top={playback ? '-30px' : 0}>
      {playback && (
        <PlayerPrisma
          layoutKey="Player"
          id={user.userId}
          party={party}
          playback={playback}
          name={user.name}
        />
      )}
      <Recommended recommended={recommended} />
      <RecentTracksPrisma recent={recent} />
      <LikedTracksPrisma liked={liked} />
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
    getUserRecommended().catch(() => []),
    getUserRecent().catch(() => []),
    getUserLiked().catch(() => []),
    prisma.party.findMany({ where: { ownerId: id } }),
    getUserTop(id, new URL(request.url)),
    getUserPlaylists(id),
  ]);

  return typedjson({ liked, party, playback, playlists, recent, recommended, top, user });
};

export default ProfilePrismaOutlet;
