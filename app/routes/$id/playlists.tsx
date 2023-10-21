import type { LoaderFunctionArgs } from '@remix-run/server-runtime';

import { Stack } from '@chakra-ui/react';

import { typedjson, useTypedLoaderData } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import TilesTrack from '~/components/tiles/TilesTrack';
import { prisma } from '~/services/db.server';

const ProfilePlaylists = () => {
  const { playlists } = useTypedLoaderData<typeof loader>();

  return (
    <Stack spacing={8} pos="relative">
      {playlists.map((playlist) => {
        return (
          <TilesTrack
            key={playlist.id}
            tracks={playlist.tracks.map((t) => t.track)}
            title={playlist.name}
          />
        );
      })}
    </Stack>
  );
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.id;
  invariant(id, 'Missing params Id');

  const playlists = await prisma.playlist.findMany({
    include: {
      tracks: {
        include: {
          track: true,
        },
        orderBy: {
          addedAt: 'desc',
        },
        take: 20,
      },
    },

    where: {
      userId: id,
    },
  });

  return typedjson({ playlists });
};

export default ProfilePlaylists;
