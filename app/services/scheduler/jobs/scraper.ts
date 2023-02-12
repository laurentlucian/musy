import invariant from 'tiny-invariant';

import { createTrackModel } from '~/lib/utils';
import { prisma } from '~/services/db.server';
import { Queue } from '~/services/scheduler/queue.server';
import { spotifyApi } from '~/services/spotify.server';

export const libraryQ = Queue<{ pages: number; userId: string }>('user-library', async (job) => {
  const { pages, userId } = job.data;
  const limit = 50;
  const { spotify } = await spotifyApi(userId);
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
      const data = {
        action: 'liked',
        albumName: track.album.name,
        albumUri: track.album.uri,
        artist: track.artists[0].name,
        artistUri: track.artists[0].uri,
        duration: track.duration_ms,
        explicit: track.explicit,
        image: track.album.images[0].url,
        likedAt: new Date(added_at),
        link: track.external_urls.spotify,
        name: track.name,
        preview_url: track.preview_url,
        uri: track.uri,

        user: {
          connect: {
            userId,
          },
        },
      };

      await prisma.likedSongs.upsert({
        create: {
          ...data,
          track: {
            connectOrCreate: {
              create: trackDb,
              where: {
                id: track.id,
              },
            },
          },
        },
        update: {
          ...data,
          track: {
            connectOrCreate: {
              create: trackDb,
              where: {
                id: track.id,
              },
            },
          },
        },
        where: {
          trackId_userId: {
            trackId: track.id,
            userId: userId,
          },
        },
      });
    }

    // sleep for 5 seconds to avoid api limit
    console.log('libraryQ -> sleeping for 5 seconds');
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
});
