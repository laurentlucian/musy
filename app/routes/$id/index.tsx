import type { LoaderArgs } from '@remix-run/server-runtime';

import { Stack } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import LikedTracks from '~/components/tiles/LikedTracks';
import Playlists from '~/components/tiles/Playlists';
import RecentTracks from '~/components/tiles/RecentTracks';
import Recommended from '~/components/tiles/Recommended';
import TopTracks from '~/components/tiles/TopTracks';
import useSessionUser from '~/hooks/useSessionUser';
import { authenticator } from '~/services/auth.server';
import { prisma } from '~/services/db.server';
import { spotifyApi } from '~/services/spotify.server';

const ProfileMain = ({
  main,
}: {
  main: [
    never[] | SpotifyApi.PlayHistoryObject[],
    never[] | SpotifyApi.SavedTrackObject[],
    never[] | SpotifyApi.TrackObjectFull[],
    never[] | SpotifyApi.PlaylistObjectSimplified[],
  ];
}) => {
  const [recent, liked, top, playlists] = main;
  return (
    <>
      {recent.length ? <RecentTracks recent={recent} /> : null}
      {liked.length ? <LikedTracks liked={liked} /> : null}
      {top.length ? <TopTracks top={top} /> : null}
      {playlists.length ? <Playlists playlists={playlists} /> : null}
    </>
  );
};

const ProfileOutlet = () => {
  const { main, recommended, user } = useTypedLoaderData<typeof loader>();
  const currentUser = useSessionUser();
  const isOwnProfile = currentUser?.userId === user.userId;

  return (
    <Stack spacing={5}>
      {isOwnProfile && <Recommended recommended={recommended} />}
      <ProfileMain main={main} />
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
    include: { ai: true, settings: true },
    where: { userId: id },
  });

  if (!user || (!session && user.settings?.isPrivate))
    throw new Response('Not found', { status: 404 });

  const url = new URL(request.url);
  const topFilter = (url.searchParams.get('top-filter') || 'medium_term') as
    | 'medium_term'
    | 'long_term'
    | 'short_term';

  const [recommended, ...main] = await Promise.all([
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
    spotify
      .getMyRecentlyPlayedTracks({ limit: 50 })
      .then((data) => data.body.items)
      .catch(() => []),
    spotify
      .getMySavedTracks({ limit: 50 })
      .then((data) => data.body.items)
      .catch(() => []),
    spotify
      .getMyTopTracks({ limit: 50, time_range: topFilter })
      .then((data) => data.body.items)
      .catch(() => []),
    spotify
      .getUserPlaylists(user.userId, { limit: 50 })
      .then((res) => res.body.items.filter((data) => data.public && data.owner.id === id))
      .catch(() => []),
  ]);

  return typedjson({ main, recommended, user });
};

// const LazyMain = () => {
//   const data = useAsyncValue();
//   console.log('data', data);

//   return null;
//   return (
//     <>
//       <RecentTracks recent={recent} />
//       {liked.length && <LikedTracks liked={liked} />}
//       <TopTracks top={top} />
//       {playlists.length && <Playlists playlists={playlists} />}
//     </>
//   );
// };

// <Suspense fallback={<Waver />}>
//  <Await resolve={lazyMain}>
//    <LazyMain />
//  </Await>
// </Suspense>

export default ProfileOutlet;
