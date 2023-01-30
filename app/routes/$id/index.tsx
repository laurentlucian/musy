import type { LoaderArgs } from '@remix-run/server-runtime';

import { Stack } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import PlayerPrisma from '~/components/player/PlayerPrisma';
import Search from '~/components/profile/Search';
import LikedTracksPrisma from '~/components/tiles/LikedTracksPrisma';
import Playlists from '~/components/tiles/Playlists';
import RecentTracksPrisma from '~/components/tiles/RecentTracksPrisma';
import Recommended from '~/components/tiles/Recommended';
import TopTracks from '~/components/tiles/TopTracks';
import useSessionUser from '~/hooks/useSessionUser';
import { authenticator } from '~/services/auth.server';
import { prisma } from '~/services/db.server';
import { redis } from '~/services/scheduler/redis.server';
import { spotifyApi } from '~/services/spotify.server';

const ProfilePrismaOutlet = () => {
  const { liked, party, playback, playlists, recent, recommended, top, user } =
    useTypedLoaderData<typeof loader>();
  const currentUser = useSessionUser();
  const isOwnProfile = currentUser?.userId === user.userId;

  return (
    <Stack spacing={5}>
      {playback && <PlayerPrisma id={user.userId} party={party} playback={playback} />}
      {!isOwnProfile && <Search />}
      {isOwnProfile && <Recommended recommended={recommended} />}
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

  const [recommended, recent, liked, party] = await Promise.all([
    prisma.recommendedSongs.findMany({
      include: {
        owner: true,
        sender: true,
        track: {
          include: {
            recommended: { include: { owner: true, sender: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      where: { AND: [{ ownerId: id }, { action: 'recommend' }] },
    }),
    prisma.recentSongs.findMany({
      orderBy: {
        playedAt: 'desc',
      },
      take: 50,
      where: {
        userId: id,
      },
    }),
    prisma.likedSongs.findMany({
      orderBy: {
        likedAt: 'desc',
      },
      take: 50,
      where: {
        userId: id,
      },
    }),
    prisma.party.findMany({ where: { ownerId: id } }),
  ]);

  const url = new URL(request.url);
  const topFilter = (url.searchParams.get('top-filter') || 'medium_term') as
    | 'medium_term'
    | 'long_term'
    | 'short_term';

  const cacheKey = 'profile_' + id;
  const cachedData = await redis.get(cacheKey);

  let top = [] as SpotifyApi.TrackObjectFull[];
  let playlists = [] as SpotifyApi.PlaylistObjectSimplified[];

  if (cachedData) {
    const data = JSON.parse(cachedData) as [
      SpotifyApi.TrackObjectFull[],
      SpotifyApi.PlaylistObjectSimplified[],
    ];
    top = data[0];
    playlists = data[1];
    console.log(`${id} profile cache hit`);
  } else {
    const data = await Promise.all([
      spotify
        .getMyTopTracks({ limit: 50, time_range: topFilter })
        .then((data) => data.body.items)
        .catch(() => []),
      spotify
        .getUserPlaylists(user.userId, { limit: 50 })
        .then((res) => res.body.items.filter((data) => data.public && data.owner.id === id))
        .catch(() => []),
    ]);
    top = data[0];
    playlists = data[1];

    // set cache for 30 minutes
    await redis.set(cacheKey, JSON.stringify(data), 'EX', 60 * 30);
  }

  return typedjson({ liked, party, playback, playlists, recent, recommended, top, user });
};

export default ProfilePrismaOutlet;
