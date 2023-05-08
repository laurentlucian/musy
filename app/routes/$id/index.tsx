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
import { authenticator } from '~/services/auth.server';
import { prisma } from '~/services/db.server';
import { redis } from '~/services/scheduler/redis.server';
import { spotifyApi } from '~/services/spotify.server';

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
  const session = await authenticator.isAuthenticated(request);

  const { spotify } = await spotifyApi(id).catch(async (e) => {
    if (e instanceof Error && e.message.includes('revoked')) {
      throw new Response('User Access Revoked', { status: 401 });
    }
    throw new Response('Failed to load Spotify', { status: 500 });
  });
  if (!spotify) {
    throw new Response('Failed to load Spotify [2]', { status: 500 });
  }
  const user = await prisma.profile.findUnique({
    include: { ai: true, playback: { include: { track: true } }, settings: true },
    where: { userId: id },
  });

  if (!user || (!session && user.settings?.isPrivate))
    throw new Response('Not found', { status: 404 });

  const { playback } = user;

  const url = new URL(request.url);
  const topFilter = (url.searchParams.get('top-filter') || 'medium_term') as
    | 'medium_term'
    | 'long_term'
    | 'short_term';

  const cacheKeyTop = 'profile_top_' + topFilter + '_' + id;
  const cacheKeyPlaylist = 'profile_playlist_' + id;

  const [recommended, recent, liked, party, cachedDataTop, cachedDataPlaylist] = await Promise.all([
    prisma.recommendedSongs.findMany({
      include: { sender: true, track: true },
      orderBy: { createdAt: 'desc' },
      where: { AND: [{ ownerId: id }, { action: 'recommend' }] },
    }),
    prisma.recentSongs
      .findMany({
        include: { track: true },
        orderBy: {
          playedAt: 'desc',
        },
        take: 50,
        where: {
          userId: id,
        },
      })
      .catch(() => []),
    prisma.likedSongs
      .findMany({
        include: { track: true },
        orderBy: {
          createdAt: 'desc',
        },
        take: 50,
        where: { userId: id },
      })
      .catch(() => []),
    prisma.party.findMany({ where: { ownerId: id } }),
    redis.get(cacheKeyTop),
    redis.get(cacheKeyPlaylist),
  ]);

  let top = [] as SpotifyApi.TrackObjectFull[];
  let playlists = [] as SpotifyApi.PlaylistObjectSimplified[];

  if (cachedDataPlaylist) {
    playlists = JSON.parse(cachedDataPlaylist) as SpotifyApi.PlaylistObjectSimplified[];
  } else {
    playlists = await spotify
      .getUserPlaylists(user.userId, { limit: 50 })
      .then((res) => res.body.items.filter((data) => data.public && data.owner.id === id))
      .catch(() => []);
    await redis.set(cacheKeyPlaylist, JSON.stringify(playlists), 'EX', 60 * 30);
  }

  if (cachedDataTop) {
    top = JSON.parse(cachedDataTop) as SpotifyApi.TrackObjectFull[];
  } else {
    top = await spotify
      .getMyTopTracks({ limit: 50, time_range: topFilter })
      .then((data) => data.body.items)
      .catch(() => []);
    await redis.set(cacheKeyTop, JSON.stringify(top), 'EX', 60 * 60 * 24);
  }

  return typedjson({ liked, party, playback, playlists, recent, recommended, top, user });
};

export default ProfilePrismaOutlet;
