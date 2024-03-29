import type { Prisma } from '@prisma/client';
import invariant from 'tiny-invariant';

import { prisma } from '~/services/db.server';
import { createTrackModel } from '~/services/prisma/spotify.server';
import { Queue } from '~/services/scheduler/queue.server';
import { getSpotifyClient } from '~/services/spotify.server';

export const libraryQ = Queue<{ pages: number; userId: string }>('user-library', async (job) => {
  const { pages, userId } = job.data;
  const limit = 50;
  const { spotify } = await getSpotifyClient(userId);
  invariant(spotify, 'libraryQ -> spotify api not found');

  // loop through pages backwards; cases where user has too many liked songs;
  // ideally, we'd want to put this in a higher time out so api limit doesn't fail the job
  for (let i = pages; i > 1; i--) {
    const {
      body: { items: liked },
    } = await spotify.getMySavedTracks({ limit, offset: i * limit });
    console.log('libraryQ -> adding page', i);
    for (const { added_at, track } of liked) {
      const trackDb = createTrackModel(track);
      const data: Prisma.LikedSongsCreateInput = {
        action: 'liked',
        createdAt: new Date(added_at),
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
      };

      await prisma.likedSongs.upsert({
        create: data,
        update: data,
        where: {
          trackId_userId: {
            trackId: track.id,
            userId,
          },
        },
      });
    }

    // sleep for 5 seconds to avoid api limit
    console.log('libraryQ -> sleeping for 5 seconds');
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
});
