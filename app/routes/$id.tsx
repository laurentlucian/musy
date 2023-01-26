import { Heading, Stack, Button } from '@chakra-ui/react';
import { Link, useCatch } from '@remix-run/react';
import type { MetaFunction, ActionArgs, LoaderArgs } from '@remix-run/node';
import { prisma } from '~/services/db.server';
import { getUserQueue, spotifyApi } from '~/services/spotify.server';
import {
  authenticator,
  getAllUsers,
  getCurrentUser,
  updateUserImage,
  updateUserName,
} from '~/services/auth.server';
import Player from '~/components/player/Player';
import Search from '~/components/Search';
import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';
import TopTracks from '~/components/tiles/TopTracks';
import RecentTracks from '~/components/tiles/RecentTracks';
import LikedTracks from '~/components/tiles/LikedTracks';
import Playlists from '~/components/tiles/Playlists';
import { askDaVinci } from '~/services/ai.server';
import { msToString } from '~/lib/utils';
import { lessThanADay } from '~/lib/utils';
import Recommended from '~/components/tiles/Recommended';
import ProfileHeader from '~/components/profile/ProfileHeader';
import PlayerPaused from '~/components/player/PlayerPaused';

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
      <RecentTracks recent={recent} />
      {liked.length && <LikedTracks liked={liked} />}
      <TopTracks top={top} />
      {playlists.length && <Playlists playlists={playlists} />}
    </>
  );
};

const Profile = () => {
  const { user, playback, currentUser, party, recommended, profileSong, main } =
    useTypedLoaderData<typeof loader>();
  const isOwnProfile = currentUser?.userId === user.userId;

  return (
    <Stack spacing={5} pb={5} pt={5} h="max-content">
      <ProfileHeader />
      {playback && playback.item?.type === 'track' ? (
        <Player id={user.userId} party={party} playback={playback} item={playback.item} />
      ) : main[0] ? (
        <PlayerPaused item={main[0][0].track} username={user.name} profileSong={profileSong} />
      ) : null}
      {currentUser?.id !== user.id && <Search />}
      <Stack spacing={5}>
        {/* {activity.length !== 0 && (
          <Tiles spacing="15px">
            {activity.map((track) => {
              return <ActivityTile key={track.id} activity={track} />;
            })}
          </Tiles>
        )} */}
      </Stack>
      {isOwnProfile && <Recommended recommended={recommended} />}
      <ProfileMain main={main} />
      {/* <Suspense fallback={<Waver />}>
        <Await resolve={lazyMain}>
          <LazyMain />
        </Await>
      </Suspense> */}
    </Stack>
  );
};

export const meta: MetaFunction = (props) => {
  return {
    title: `musy - ${props.data?.user?.name.split(' ')[0] ?? ''}`,
  };
};

export const loader = async ({ request, params }: LoaderArgs) => {
  const id = params.id;
  invariant(id, 'Missing params Id');
  const session = await authenticator.isAuthenticated(request);

  const url = new URL(request.url);
  const topFilter = (url.searchParams.get('top-filter') || 'medium_term') as
    | 'medium_term'
    | 'long_term'
    | 'short_term';

  const user = await prisma.profile.findUnique({
    where: { userId: id },
    include: { settings: true, ai: true },
  });

  if (!user || (!session && user.settings?.isPrivate))
    throw new Response('Not found', { status: 404 });

  const { spotify } = await spotifyApi(id).catch(async (e) => {
    console.log('e', e);
    if (e instanceof Error && e.message.includes('revoked')) {
      throw new Response('User Access Revoked', { status: 401 });
    }
    throw new Response('Failed to load Spotify', { status: 500 });
  });
  if (!spotify) {
    throw new Response('Failed to load Spotify [2]', { status: 500 });
  }

  const spotifyProfile = await spotify.getMe();
  const pfp = spotifyProfile?.body.images;
  if (pfp) {
    await updateUserImage(id, pfp[0].url);
  }

  const spotifyProfileName = await spotify.getMe().catch(() => null);
  const name = spotifyProfileName?.body.display_name;
  if (name) {
    await updateUserName(id, name);
  }

  async function getProfileSong(id: string) {
    const settings = await prisma.settings.findUnique({
      where: { userId: id },
      include: { profileSong: true },
    });
    if (settings) {
      return settings.profileSong;
    } else {
      return null;
    }
  }

  const [activity, party, { currently_playing: playback, queue }, users, recommended, profileSong] =
    await Promise.all([
      prisma.queue.findMany({
        where: { OR: [{ userId: id }, { ownerId: id }] },
        include: { user: true, track: true, owner: { select: { user: true, accessToken: false } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.party.findMany({ where: { ownerId: id } }),
      getUserQueue(id).catch(() => {
        return {
          currently_playing: null,
          queue: [],
        };
      }),
      getAllUsers().then((user) => user.filter((user) => user.userId !== id)),
      prisma.recommendedSongs.findMany({
        where: { AND: [{ ownerId: id }, { action: 'recommend' }] },
        orderBy: { createdAt: 'desc' },
        include: {
          owner: true,
          sender: true,
          track: {
            include: {
              recommended: { include: { sender: true, owner: true } },
            },
          },
        },
      }),
      getProfileSong(id),
    ]);

  const recentDb = await prisma.recentSongs.findMany({
    where: { userId: id },
    orderBy: { playedAt: 'desc' },
  });

  const filteredRecent = recentDb.filter(({ playedAt }) => {
    const d = new Date(playedAt);
    return lessThanADay(d);
    // return lessThanAWeek(d);
  });

  const listened = msToString(
    filteredRecent.map((track) => track.duration).reduce((a, b) => a + b, 0),
  );

  // [recent, liked, top, playlists]
  const main = await Promise.all([
    spotify
      .getMyRecentlyPlayedTracks({ limit: 50 })
      .then((data) => data.body.items)
      .catch(() => []),
    spotify
      .getMySavedTracks({ limit: 50 })
      .then((data) => data.body.items)
      .catch(() => []),
    spotify
      .getMyTopTracks({ time_range: topFilter, limit: 50 })
      .then((data) => data.body.items)
      .catch(() => []),
    spotify
      .getUserPlaylists(user.userId, { limit: 50 })
      .then((res) => res.body.items.filter((data) => data.public && data.owner.id === id))
      .catch(() => []),
  ]);

  const currentUser = await getCurrentUser(request);
  if (currentUser) {
    const { spotify } = await spotifyApi(currentUser.userId);
    invariant(spotify, 'Spotify API Error');
    const {
      body: [following],
    } = await spotify.isFollowingUsers([id]);

    // return defer({
    //   user,
    //   activity,
    //   party,
    //   playback,
    //   currentUser,
    //   following,
    //   queue,
    //   recommended,
    //   users,
    //   listened,
    //   lazyMain,
    // });

    return typedjson({
      user,
      activity,
      party,
      playback,
      currentUser,
      following,
      queue,
      recommended,
      profileSong,
      users,
      listened,
      main,
    });
  }

  // return defer({
  //   user,
  //   activity,
  //   party,
  //   playback,
  //   currentUser,
  //   following: null,
  //   queue,
  //   recommended,
  //   users,
  //   listened,
  //   lazyMain,
  // });

  return typedjson({
    user,
    activity,
    party,
    playback,
    currentUser,
    following: null,
    queue,
    recommended,
    profileSong,
    users,
    listened,
    main,
  });
};

export const action = async ({ request, params }: ActionArgs) => {
  const id = params.id;
  invariant(id, 'Missing params Id');

  const data = await request.formData();
  const bio = data.get('bio');
  const follow = data.get('follow');
  const mood = data.get('mood');
  const currentUser = await getCurrentUser(request);
  invariant(currentUser, 'Missing current user');
  const { spotify } = await spotifyApi(currentUser.userId);
  invariant(spotify, 'Spotify API Error');

  if (follow === 'true') {
    await spotify.followUsers([id]);
  } else if (follow === 'false') {
    await spotify.unfollowUsers([id]);
  }

  if (typeof bio === 'string') {
    const user = await prisma.profile.update({ where: { userId: id }, data: { bio } });
    return user;
  }

  if (typeof mood === 'string') {
    const { spotify } = await spotifyApi(id);
    invariant(spotify, 'Spotify API Error');
    const recent = await spotify.getMyRecentlyPlayedTracks({ limit: 50 });
    const tracks = recent.body.items.map((item) => ({
      song_name: item.track.name,
      artist_name: item.track.artists[0].name,
      album_name: item.track.album.name,
    }));

    const prompt = `Based on these songs given below, describe my current mood in one word. 
    ${JSON.stringify(tracks)}`;
    const response = (await askDaVinci(prompt)).split('.')[0];
    await prisma.aI.upsert({
      where: { userId: id },
      create: { mood: response, userId: id },
      update: { mood: response },
    });
  }

  return null;
};

export const CatchBoundary = () => {
  let caught = useCatch();
  switch (caught.status) {
    case 401:
      break;
    case 404:
      break;

    default:
      throw new Error(caught.data || caught.statusText);
  }

  return (
    <>
      <Heading fontSize={['xl', 'xxl']}>
        {caught.status} {caught.data}
      </Heading>
      <Button mt={4} as={Link} to="/">
        Go home
      </Button>
    </>
  );
};

export { ErrorBoundary } from '~/components/error/ErrorBoundary';

export default Profile;
