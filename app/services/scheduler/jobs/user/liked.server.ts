import type { Prisma } from '@prisma/client';

import { isProduction } from '~/lib/utils';
import { prisma } from '~/services/db.server';
import { createTrackModel } from '~/services/prisma/spotify.server';
import { getSpotifyClient } from '~/services/spotify.server';

import { Queue } from '../../queue.server';
import { libraryQ } from '../scraper.server';
import { debugLikedQ } from '../user.server';

export const likedQ = Queue<{ userId: string }>('update_liked', async (job) => {
  const { userId } = job.data;
  debugLikedQ('starting...');

  const { spotify } = await getSpotifyClient(userId);

  if (!spotify) {
    debugLikedQ('no spotify client');
    return;
  }
  const {
    body: { items: liked, total },
  } = await spotify.getMySavedTracks({ limit: 50 });

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
  debugLikedQ('added liked tracks');

  const dbTotal = await prisma.likedSongs.count({
    where: { userId },
  });

  // we want to scrape all of user's liked songs, this is useful for showing dynamic UI to the current logged in user
  // so, if the total from spotify is greater than the total in the db
  // loop through the rest of the pages and add them to the db

  if (total > dbTotal && isProduction) {
    // by default, don't scrape all liked tracks in dev
    // change above to !isProduction to scrape all liked tracks as needed
    // make sure to uncomment lines 221&222 to only run this job for your own user id

    const limit = 50;
    const pages = Math.ceil(total / limit);
    debugLikedQ('total > dbTotal', total, dbTotal, pages);
    const {
      body: {
        items: [lastTrack],
      },
    } = await spotify.getMySavedTracks({ limit: 1, offset: total - 1 });
    // note: if user disliked songs after we've added all to db, this would've run every time job repeats
    // if last track exists in our db, then don't scrape all pages
    debugLikedQ('lastTrack', lastTrack.track.name);
    const exists = await prisma.likedSongs.findUnique({
      where: {
        trackId_userId: {
          trackId: lastTrack.track.id,
          userId,
        },
      },
    });
    debugLikedQ('last track exists?', exists);

    if (!exists) {
      debugLikedQ(
        'adding all user liked tracks to db',
        'pages',
        pages,
        'total',
        total,
        'dbTotal',
        dbTotal,
      );
      await libraryQ.add(
        'user-library',
        {
          pages,
          userId,
        },
        {
          removeOnComplete: true,
          removeOnFail: true,
        },
      );
    } else {
      debugLikedQ('all liked tracks already in db total:', total, 'dbTotal:', dbTotal);
    }
  }
  debugLikedQ('completed');
});
