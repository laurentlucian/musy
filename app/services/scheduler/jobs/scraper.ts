import { Queue } from '~/services/scheduler/queue.server';
import { spotifyApi } from '~/services/spotify.server';
import { createTrackModel } from '~/lib/utils';
import { prisma } from '~/services/db.server';
import invariant from 'tiny-invariant';

export const libraryQ = Queue<{ userId: string; pages: number }>('user-library', async (job) => {
  const { userId, pages } = job.data;
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
    for (const { track, added_at } of liked) {
      const trackDb = createTrackModel(track);
      const data = {
        likedAt: new Date(added_at),
        name: track.name,
        uri: track.uri,
        albumName: track.album.name,
        albumUri: track.album.uri,
        artist: track.artists[0].name,
        artistUri: track.artists[0].uri,
        image: track.album.images[0].url,
        explicit: track.explicit,
        preview_url: track.preview_url,
        link: track.external_urls.spotify,
        duration: track.duration_ms,
        action: 'liked',

        user: {
          connect: {
            userId,
          },
        },
      };

      await prisma.likedSongs.upsert({
        where: {
          trackId_userId: {
            trackId: track.id,
            userId: userId,
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
      });
    }

    // sleep for 5 seconds to avoid api limit
    console.log('libraryQ -> sleeping for 5 seconds');
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
});
