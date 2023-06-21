import invariant from 'tiny-invariant';

import { isProduction, minutesToMs } from '~/lib/utils';
import { prisma } from '~/services/db.server';
import { getAllUsersId } from '~/services/prisma/users.server';
import { Queue } from '~/services/scheduler/queue.server';
import { getSpotifyClient } from '~/services/spotify.server';

import { playbackQ } from './playback.server';
import { playbackCreatorQ } from './playback/creator.server';
import { followQ } from './user/follow.server';
import { likedQ } from './user/liked.server';
import { profileQ } from './user/profile.server';
import { recentQ } from './user/recent.server';

export const userQ = Queue<{ userId: string }>(
  'update_user',
  async (job) => {
    const { userId } = job.data;
    console.log('userQ -> pending job starting...', userId);

    const profile = await prisma.user.findUnique({
      include: { user: true },
      where: { id: userId },
    });

    const { spotify } = await getSpotifyClient(userId);

    if (!profile || !profile.user || !spotify) {
      console.log(`userQ ${userId} removed -> user not found`);
      const jobKey = job.repeatJobKey;
      if (jobKey) {
        await userQ.removeRepeatableByKey(jobKey);
      }
      return;
    }

    await recentQ.add('update_recent', { userId });
    await likedQ.add('update_liked', { userId });
    await followQ.add('update_follow', { userId });
    await profileQ.add('update_profile', { userId });
    console.log('userQ -> completed');

    await playbackCreatorQ.add('playback_creator', null);
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
  var __didRegisterUserQ: boolean | undefined;
}

export const addUsersToQueue = async () => {
  console.log('addUsersToQueue -> starting...');
  // To ensure this function only runs once per environment,
  // we use a global variable to keep track if it has run
  const getUserQs = async () =>
    (await userQ.getRepeatableJobs()).map((j) => [
      j.name,

      j.next,
      new Date(j.next).toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      }),
    ]);
  console.log('global.__didRegisterUserQ', global.__didRegisterUserQ);
  if (global.__didRegisterUserQ) {
    // and stop if it did.

    console.log('addUsersToQueue -> already registered, repeating jobs:', await getUserQs());
    console.log(
      'addUsersToQueue -> playbackQ',
      (await playbackQ.getDelayed()).map((j) => [j.name, j.data]),
    );

    return;
  }

  // await prisma.playback.deleteMany();
  // delete all playbackQ jobs
  // await playbackQ.pause();
  // // await playbackQ.obliterate({ force: true });
  console.log(
    'addUsersToQueue -> playbackQ',
    (await playbackQ.getDelayed()).map((j) => [j.name, j.data]),
  );
  // console.log('addUsersToQueue -> obliterated playbackQ');

  // needed this once because forgot to save duration_ms in db
  // await addDurationToRecent();
  // console.log('addUsersToQueue -> added all durations to recent');

  await userQ.pause().catch(console.log); // pause all jobs before obliterating
  await userQ.obliterate({ force: true }).catch(console.log); // https://github.com/taskforcesh/bullmq/issues/430
  console.log('addUsersToQueue -> obliterated userQ (or not)');
  console.log('addUsersToQueue -> current queues', await getUserQs());

  // for testing
  // await userQ.add('update_user', { userId: '1295028670' });
  // return;

  const users = await getAllUsersId();
  console.log('addUsersToQueue -> users..', users, users.length);
  // https: github.com/OptimalBits/bull/issues/1731#issuecomment-639074663
  // bulkAll doesn't support repeateable jobs
  for (const userId of users) {
    await userQ.add(
      'update_user',
      { userId: userId },
      {
        backoff: {
          delay: minutesToMs(1),
          type: 'exponential',
        },
        // a job with duplicate id will not be added
        jobId: userId,
        removeOnComplete: true,
        removeOnFail: true,
        repeat: { every: minutesToMs(isProduction ? 30 : 60) },
      },
    );
  }

  // repeateableJobs are started with delay, so run these manually at startup
  await userQ.addBulk(
    users.map((userId) => ({
      data: {
        userId,
      },
      name: 'update_user',
    })),
  );

  console.log(
    'addUsersToQueue -> non repeateable jobs created (only at startup):',
    await userQ.getJobCounts(),
  );

  // if (!isProduction) {
  //   await addMissingTracks();
  // }
  // if ((await longScriptQ.getJobs())?.length === 0 && isProduction) {
  //   longScriptQ.add('long-script', null);
  // }

  console.log('addUsersToQueue -> done');
  global.__didRegisterUserQ = true;
};

// ------------------------------------------------------------- SCRIPTS

export const addMissingTracks = async () => {
  const { spotify } = await getSpotifyClient('1295028670');
  invariant(spotify, 'spotify api not found');
  const missingLiked = await prisma.$queryRaw<{ id: number; trackId: string; userId: string }[]>`
    SELECT trackId, id, userId
    FROM LikedSongs
    WHERE NOT EXISTS (
      SELECT 1
      FROM Track
      WHERE Track.id = LikedSongs.trackId
    );
  `;
  const missingRecent = await prisma.$queryRaw<{ id: number; trackId: string; userId: string }[]>`
    SELECT trackId, id, userId
    FROM RecentSongs
    WHERE NOT EXISTS (
      SELECT 1
      FROM Track
      WHERE Track.id = RecentSongs.trackId
    );
  `;
  const missingQueues = await prisma.$queryRaw<{ id: number; trackId: string; userId: string }[]>`
    SELECT trackId, id, userId
    FROM Queue
    WHERE trackId IS NULL OR NOT EXISTS (
      SELECT 1
      FROM Track
      WHERE Track.id = Queue.trackId
    );
  `;

  console.log('addMissingTracks -> missing tracks', missingLiked.length);
  console.log('addMissingTracks -> missing recent', missingRecent.length);
  console.log('addMissingTracks -> missing queue', missingQueues.length);

  const deleteRows = async (table: string, ids: string[]) => {
    const trackIds = [...new Set(ids)];
    switch (table) {
      case 'LikedSongs':
        await prisma.likedSongs.deleteMany({
          where: { trackId: { in: trackIds } },
        });
        break;
      case 'RecentSongs':
        await prisma.recentSongs.deleteMany({
          where: { trackId: { in: trackIds } },
        });
        break;
      case 'Queue':
        await prisma.queue.deleteMany({
          where: { trackId: { in: trackIds } },
        });
        break;
    }
  };

  await deleteRows(
    'LikedSongs',
    missingLiked.map((t) => t.trackId),
  );
  await deleteRows(
    'RecentSongs',
    missingRecent.map((t) => t.trackId),
  );
  await deleteRows(
    'Queue',
    missingQueues.map((t) => t.trackId),
  );

  // connect missing likedSongs to existing track model
  //   for (const missing of missingRecent) {
  //     const track = await prisma.track.findUnique({
  //       where: { id: missing.trackId },
  //     });
  //     if (track) {
  //       console.log('addMissingTracks -> track exists; connecting');
  //       await prisma.recentSongs.update({
  //         data: { track: { connect: { id: track.id } } },
  //         where: { id: missing.id },
  //       });
  //     }
  //   }

  //   const missingRecentAfter = await prisma.$queryRaw<
  //     { id: number; trackId: string; userId: string }[]
  //   >`
  //     SELECT trackId, id, userId
  //     FROM RecentSongs
  //     WHERE NOT EXISTS (
  //       SELECT 1
  //       FROM Track
  //       WHERE Track.id = RecentSongs.trackId
  //     );
  // `;

  // const trackIdsDuplicate = missingRecentAfter.map((t) => t.trackId);
  // const trackIds = [...new Set(trackIdsDuplicate)];
  // console.log('addMissingTracks -> trackIds', trackIds.length);

  // const pages = [];

  // for (let i = 0; i < trackIds.length; i += 50) {
  // pages.push(trackIds.slice(i, i + 50));
  // }

  // console.log('addMissingTracks -> pages', pages.length);
  // for (const page of pages) {
  // console.log('addMissingTracks -> pages remaining', pages.length - pages.indexOf(page));

  // ⚠️ don't run on development
  // @todo add fn to delete missing tracks from dev db
  // const {
  //   body: { tracks },
  // } = await spotify.getTracks(page);
  // try {
  //   console.log('addMissingTracks -> retrieved spotify; tracks', tracks.length);
  //   for (const track of tracks) {
  //     const trackDb = createTrackModel(track);

  //     const instances = await prisma.recentSongs.findMany({
  //       where: { trackId: track.id },
  //     });
  //     console.log(
  //       'addMissingTracks -> likedsongs without relation',
  //       instances.length,
  //       track.name,
  //     );

  //     for (const instance of instances) {
  //       console.log('addMissingTracks -> loop over instance', instance.userId);

  //       await prisma.recentSongs.update({
  //         data: {
  //           track: {
  //             connectOrCreate: { create: trackDb, where: { id: track.id } },
  //           },
  //         },
  //         where: { id: instance.id },
  //       });
  //       continue;
  //     }
  //     console.log('addMissingTracks -> track done', track.name);
  //   }
  // } catch (e) {
  //   console.log('addMissingTracks -> error', e);
  // }
  // console.log('addMissingTracks -> page done');
  // }

  console.log('addMissingTracks -> done');
};
