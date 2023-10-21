import { useParams } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@remix-run/server-runtime';

import { Stack } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import Player from '~/components/profile/player/spotify/Player';
import TrackTiles from '~/components/tiles/TilesTrack';
import { getCacheControl } from '~/lib/utils';
import { prisma } from '~/services/db.server';
import {
  getUserSpotifyLiked,
  getUserSpotifyPlayback,
  getUserSpotifyRecent,
} from '~/services/prisma/spotify.server';
import { getUserRecommended } from '~/services/prisma/tracks.server';
import { getUserSpotify, getUserSpotifyTop } from '~/services/spotify.server';

const ProfileSpotifyOutlet = () => {
  const { id } = useParams();
  const { liked, playback, recent, recommended, top } = useTypedLoaderData<typeof loader>();

  return (
    <Stack spacing={5} pos="relative" top={playback ? '-30px' : 0}>
      {playback && playback.item?.type === 'track' && (
        <Player layoutKey="Player" id={id as string} party={[]} playback={playback} />
      )}
      <TrackTiles tracks={recommended} title="Recommended" />
      <TrackTiles tracks={recent} title="Recent" />
      <TrackTiles tracks={liked} title="Liked" />
      <TrackTiles tracks={top} title="Top" />
    </Stack>
  );
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const id = params.id;
  invariant(id, 'Missing params Id');

  const { spotify } = await getUserSpotify(id);
  const user = await prisma.profile.findUnique({
    include: { ai: true, settings: true },
    where: { userId: id },
  });

  const [recommended, playback, recent, liked, top] = await Promise.all([
    getUserRecommended(id),
    getUserSpotifyPlayback(id),
    getUserSpotifyRecent(id),
    getUserSpotifyLiked(id),
    getUserSpotifyTop(id, new URL(request.url)),
  ]);

  return typedjson(
    { liked, playback, recent, recommended, top, user },
    {
      headers: {
        ...getCacheControl(),
      },
    },
  );
};

export { ErrorBoundary } from '~/components/error/ErrorBoundary';
export default ProfileSpotifyOutlet;
