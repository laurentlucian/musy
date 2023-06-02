import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';

import { typedjson } from 'remix-typedjson';
import invariant from 'tiny-invariant';

import { getMoodFromPrisma, getMoodFromSpotify } from '~/services/ai.server';
import { prisma } from '~/services/db.server';
import { getSpotifyClient } from '~/services/spotify.server';

export const action = async ({ request }: ActionArgs) => {
  const body = await request.formData();
  const userId = body.get('userId');

  if (typeof userId !== 'string') {
    return typedjson('Request Error');
  }

  const recent = await prisma.recentSongs.findMany({
    include: { track: { select: { albumName: true, artist: true, name: true } } },
    take: 25,
    where: { userId },
  });

  let response: string;

  if (recent.length > 0) {
    response = await getMoodFromPrisma(recent);
  } else {
    const { spotify } = await getSpotifyClient(userId);
    invariant(spotify, 'Spotify API Error');
    const recent = await spotify.getMyRecentlyPlayedTracks({ limit: 25 });
    response = await getMoodFromSpotify(recent.body);
  }

  await prisma.aI.upsert({
    create: { mood: response, userId },
    update: { mood: response },
    where: { userId },
  });

  return null;
};

export const loader = () => {
  throw json({}, { status: 404 });
};
