import type { Prisma } from '@prisma/client';

import { prisma } from '~/services/db.server';
import { createTrackModel } from '~/services/prisma/spotify.server';
import { getSpotifyClient } from '~/services/spotify.server';

import { Queue } from '../../queue.server';
import { debugRecentQ } from '../user.server';

export const recentQ = Queue<{ userId: string }>('update_recent', async (job) => {
  const { userId } = job.data;
  debugRecentQ('starting...');

  const { spotify } = await getSpotifyClient(userId);

  if (!spotify) {
    debugRecentQ('no spotify client');
    return;
  }

  debugRecentQ('adding recent tracks to db');
  const {
    body: { items: recent },
  } = await spotify.getMyRecentlyPlayedTracks({ limit: 50 });
  for (const { played_at, track } of recent) {
    const trackDb = createTrackModel(track);
    const data: Prisma.RecentSongsCreateInput = {
      action: 'played',
      playedAt: new Date(played_at),
      track: {
        connectOrCreate: {
          create: trackDb,
          where: {
            id: track.id,
          },
        },
      },
      user: {
        connect: {
          userId,
        },
      },
      verifiedFromSpotify: true,
    };

    const playedAt = new Date(played_at);
    await prisma.recentSongs.upsert({
      create: data,
      update: data,
      where: {
        playedAt_userId: {
          playedAt,
          userId,
        },
      },
    });

    // HACK(po): this is a hack to make sure we don't have duplicate recent songs
    // See model on prisma schema for docs
    await prisma.recentSongs.deleteMany({
      where: {
        // only if it is within 10 minutes of the current song
        // playedAt: {
        //   gte: new Date(playedAt.getTime() - minutesToMs(10)),
        //   lte: new Date(playedAt.getTime() + minutesToMs(10)),
        // },
        // trackId: track.id,
        userId,
        verifiedFromSpotify: false,
      },
    });
  }
});
