import debug from 'debug';
import invariant from 'tiny-invariant';

import { minutesToMs } from '~/lib/utils';
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

const debugUserQ = debug('userQ');
export const debugLikedQ = debugUserQ.extend('likedQ');
export const debugFollowQ = debugUserQ.extend('followQ');
export const debugProfileQ = debugUserQ.extend('profileQ');
export const debugRecentQ = debugUserQ.extend('recentQ');

export const userQ = Queue<{ userId: string }>(
  'update_user',
  async (job) => {
    const { userId } = job.data;
    debugUserQ('pending job starting...', userId);

    const profile = await prisma.user.findUnique({
      include: { user: true },
      where: { id: userId },
    });

    const { spotify } = await getSpotifyClient(userId);

    if (!profile || !profile.user || !spotify) {
      debugUserQ(`userQ ${userId} removed -> user not found`);
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
    debugUserQ('completed');

    await playbackCreatorQ.add('playback_creator', null);
  },
  {
    limiter: {
      duration: minutesToMs(1),
      max: 1,
    },
  },
);

const debugStartUp = debugUserQ.extend('startUp');

const userQStartup = async () => {
  debugStartUp('starting...');

  const timestampToDate = (timestamp: number) =>
    new Date(timestamp).toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });

  const getUserQs = async () =>
    (await userQ.getRepeatableJobs()).map((j) => [timestampToDate(j.next), j.key]);

  const getPlaybackQs = async () =>
    (await playbackQ.getDelayed()).map((j) => [timestampToDate(j.timestamp), j.name, j.data]);

  const userQs = await getUserQs();
  const userQexists = userQs.length > 0;
  if (userQexists) {
    debugStartUp('already registered, repeatable userQ:', userQs);

    debugStartUp('playbackQs', await getPlaybackQs());

    return;
  }

  // await prisma.playback.deleteMany();
  // delete all playbackQ jobs
  // await playbackQ.pause();
  // // await playbackQ.obliterate({ force: true });

  debugStartUp('not registered', userQs);
  debugStartUp('playbackQs', await getPlaybackQs());
  // debugStartUp('obliterated playbackQ');

  await userQ.pause().catch(debugStartUp); // pause all jobs before obliterating
  await userQ.obliterate({ force: true }).catch(debugStartUp); // https://github.com/taskforcesh/bullmq/issues/430
  debugStartUp('obliterated userQ (or not); userQs now', await getUserQs());

  // for testing
  // await userQ.add('update_user', { userId: '1295028670' });
  // return;

  const users = await getAllUsersId();
  debugStartUp(`adding ${users.length} users to userQ..`);
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
        repeat: { every: minutesToMs(30) },
      },
    );
  }

  debugStartUp('repeatable jobs created:', await userQ.getJobCounts());

  // repeateableJobs are started with delay, so run these manually at startup
  await userQ.addBulk(
    users.map((userId) => ({
      data: {
        userId,
      },
      name: 'update_user',
    })),
  );

  debugStartUp('immediate jobs created', await userQ.getJobCounts());

  // if (!isProduction) {
  //   await addMissingTracks();
  // }
  // if ((await longScriptQ.getJobs())?.length === 0 && isProduction) {
  //   longScriptQ.add('long-script', null);
  // }

  debugStartUp('completed');
};

void userQStartup();

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

  debugUserQ('addMissingTracks -> missing tracks', missingLiked.length);
  debugUserQ('addMissingTracks -> missing recent', missingRecent.length);
  debugUserQ('addMissingTracks -> missing queue', missingQueues.length);

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
  //       debugUserQ('addMissingTracks -> track exists; connecting');
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
  // debugUserQ('addMissingTracks -> trackIds', trackIds.length);

  // const pages = [];

  // for (let i = 0; i < trackIds.length; i += 50) {
  // pages.push(trackIds.slice(i, i + 50));
  // }

  // debugUserQ('addMissingTracks -> pages', pages.length);
  // for (const page of pages) {
  // debugUserQ('addMissingTracks -> pages remaining', pages.length - pages.indexOf(page));

  // ⚠️ don't run on development
  // @todo add fn to delete missing tracks from dev db
  // const {
  //   body: { tracks },
  // } = await spotify.getTracks(page);
  // try {
  //   debugUserQ('addMissingTracks -> retrieved spotify; tracks', tracks.length);
  //   for (const track of tracks) {
  //     const trackDb = createTrackModel(track);

  //     const instances = await prisma.recentSongs.findMany({
  //       where: { trackId: track.id },
  //     });
  //     debugUserQ(
  //       'addMissingTracks -> likedsongs without relation',
  //       instances.length,
  //       track.name,
  //     );

  //     for (const instance of instances) {
  //       debugUserQ('addMissingTracks -> loop over instance', instance.userId);

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
  //     debugUserQ('addMissingTracks -> track done', track.name);
  //   }
  // } catch (e) {
  //   debugUserQ('addMissingTracks -> error', e);
  // }
  // debugUserQ('addMissingTracks -> page done');
  // }

  debugUserQ('addMissingTracks -> done');
};
