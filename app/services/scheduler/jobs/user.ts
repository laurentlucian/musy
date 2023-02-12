import type { Prisma } from '@prisma/client';

import { createTrackModel, isProduction, minutesToMs } from '~/lib/utils';
import { getAllUsers } from '~/services/auth.server';
import { prisma } from '~/services/db.server';
import { Queue } from '~/services/scheduler/queue.server';
import { spotifyApi } from '~/services/spotify.server';

import { playbackCreator, playbackQ } from './playback';
import { libraryQ } from './scraper';

export const userQ = Queue<{ userId: string }>(
  'update_tracks',
  async (job) => {
    const { userId } = job.data;
    console.log('userQ -> pending job starting...', userId);

    await playbackCreator();
    const profile = await prisma.user.findUnique({
      include: { user: true },
      where: { id: userId },
    });

    const { spotify } = await spotifyApi(userId);

    if (!profile || !profile.user || !spotify) {
      console.log(`userQ ${userId} removed -> user not found`);
      const jobKey = job.repeatJobKey;
      if (jobKey) {
        await userQ.removeRepeatableByKey(jobKey);
      }
      return null;
    }

    console.log('userQ -> adding recent tracks to db', userId);
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
            userId: userId,
          },
        },
      });

      // HACK(po): this is a hack to make sure we don't have duplicate recent songs
      // See model on prisma schema for docs
      await prisma.recentSongs.deleteMany({
        where: {
          // only if it is within 10 minutes of the current song
          playedAt: {
            gte: new Date(playedAt.getTime() - minutesToMs(10)),
            lte: new Date(playedAt.getTime() + minutesToMs(10)),
          },
          trackId: track.id,
          userId,
          verifiedFromSpotify: false,
        },
      });
    }

    console.log('userQ -> adding liked tracks to db', userId);
    const {
      body: { items: liked, total },
    } = await spotify.getMySavedTracks({ limit: 50 });

    for (const { added_at, track } of liked) {
      const trackDb = createTrackModel(track);

      const data: Prisma.LikedSongsCreateInput = {
        action: 'liked',

        likedAt: new Date(added_at),

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
            userId: userId,
          },
        },
      });
    }
    console.log('userQ -> added liked tracks', userId);

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
      console.log('userQ -> total > dbTotal', total, dbTotal, pages, userId);
      const {
        body: {
          items: [lastTrack],
        },
      } = await spotify.getMySavedTracks({ limit: 1, offset: total - 1 });
      // note: if user disliked songs after we've added all to db, this would've run every time job repeats
      // if last track exists in our db, then don't scrape all pages
      console.log('userQ -> lastTrack', lastTrack.track.name);
      const exists = await prisma.likedSongs.findUnique({
        where: {
          trackId_userId: {
            trackId: lastTrack.track.id,
            userId,
          },
        },
      });
      console.log('userQ -> last track exists?', exists);

      if (!exists) {
        console.log(
          'userQ -> adding all user liked tracks to db',
          userId,
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
        console.log('userQ -> all liked tracks already in db', userId, total, dbTotal);
      }
    }

    console.log('userQ -> completed', userId);
  },
  {
    limiter: {
      duration: minutesToMs(1),
      max: 1,
    },
  },
);

declare global {
  // eslint-disable-next-line no-var
  var __didRegisterLikedQ: boolean | undefined;
}

export const addUsersToQueue = async () => {
  console.log('addUsersToQueue -> starting...');
  // To ensure this function only runs once per environment,
  // we use a global variable to keep track if it has run
  if (global.__didRegisterLikedQ) {
    // and stop if it did.

    // console.log(
    //   'addUsersToQueue -> already registered, repeating jobs:',
    //   (await userQ.getRepeatableJobs()).map((j) => [
    //     j.name,

    //     j.next,
    //     new Date(j.next).toLocaleString('en-US', {
    //       hour: 'numeric',
    //       minute: 'numeric',
    //       second: 'numeric',
    //     }),
    //   ]),
    // );

    console.log(
      'playbackQ',
      (await playbackQ.getDelayed()).map((j) => [j.name, j.data]),
    );

    return;
  }

  await prisma.playback.deleteMany();

  console.log(
    'playbackQ',
    (await playbackQ.getDelayed()).map((j) => [j.name, j.data]),
  );

  // needed this once because forgot to save duration_ms in db
  // await addDurationToRecent();
  // console.log('addUsersToQueue -> added all durations to recent');

  const users = await getAllUsers();
  console.log(
    'addUsersToQueue -> users..',
    users.map((u) => u.userId),
    users.length,
  );

  // await userQ.pause(); // pause all jobs before obliterating
  // await userQ.obliterate({ force: true }); // https://github.com/taskforcesh/bullmq/issues/430
  console.log('addUsersToQueue -> obliterated userQ');

  // for testing
  // await userQ.add('update_liked', { userId: '1295028670' });
  // return;

  // https: github.com/OptimalBits/bull/issues/1731#issuecomment-639074663
  // bulkAll doesn't support repeateable jobs
  for (const user of users) {
    await userQ.add(
      user.userId,
      { userId: user.userId },
      {
        backoff: {
          delay: minutesToMs(1),
          type: 'exponential',
        },
        // a job with duplicate id will not be added
        jobId: user.userId,
        removeOnComplete: true,
        removeOnFail: true,
        repeat: { every: minutesToMs(isProduction ? 30 : 60) },
      },
    );
  }

  // repeateableJobs are started with delay, so run these manually at startup
  await userQ.addBulk(
    users.map((user) => ({
      data: {
        userId: user.userId,
      },
      name: 'update_liked',
    })),
  );

  console.log(
    'addUsersToQueue -> non repeateable jobs created (only at startup):',
    await userQ.getJobCounts(),
  );

  // await addMissingTracks();
  // if ((await longScriptQ.getJobs())?.length === 0 && isProduction) {
  //   longScriptQ.add('long-script', null);
  // }

  console.log('addUsersToQueue -> done');
  global.__didRegisterLikedQ = true;
};

// ------------------------------------------------------------- SCRIPTS
