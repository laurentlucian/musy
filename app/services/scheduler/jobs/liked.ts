import type { LikedSongs } from '@prisma/client';
import { minutesToMs } from '~/lib/utils';
import { prisma } from '~/services/db.server';
import { Queue } from '~/services/scheduler/queue.server';
import { getUserLikedSongs } from '~/services/spotify.server';

export const likedQ = Queue<{ userId: string }>(
  'update_liked',
  async (job) => {
    const { userId } = job.data;
    console.log('likedQ -> pending job starting...', userId);
    const profile = await prisma.user.findUnique({
      where: { id: userId },
      include: { user: true },
    });

    if (!profile || !profile.user) {
      console.log('likedQ silently failed -> user not found');
      return null;
    }

    const liked = await getUserLikedSongs(userId);

    console.log('likedQ -> adding tracks to db', userId);
    for (const { track, added_at } of liked) {
      const song: Omit<LikedSongs, 'id'> = {
        trackId: track.id,
        likedAt: new Date(added_at),
        userId: userId,
        name: track.name,
        uri: track.uri,
        albumName: track.album.name,
        albumUri: track.album.uri,
        artist: track.artists[0].name,
        artistUri: track.artists[0].uri,
        image: track.album.images[0].url,
        explicit: track.explicit,
        action: 'liked',
      };

      await prisma.likedSongs.upsert({
        where: {
          trackId_userId: {
            trackId: track.id,
            userId: userId,
          },
        },
        update: song,
        create: song,
      });
    }

    console.log('likedQ -> completed', userId);
  },
  {
    limiter: {
      max: 2,
      duration: minutesToMs(0.5),
    },
  },
);

declare global {
  var __didRegisterLikedQ: boolean | undefined;
}

export const addUsersToLikedQueue = async () => {
  console.log('addUsersToLikedQueue -> starting...');
  // To ensure this function only runs once per environment,
  // we use a global variable to keep track if it has run
  if (global.__didRegisterLikedQ) {
    // and stop if it did.

    console.log(
      'addUsersToLikedQueue -> already registered, repeating jobs:',
      (await likedQ.getRepeatableJobs()).map((j) => [
        j.name,

        j.next,
        new Date(j.next).toLocaleString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
        }),
      ]),
    );

    return;
  }

  const users = await prisma.user.findMany();
  console.log(
    'addUsersToLikedQueue -> users..',
    users.map((u) => u.id),
    users.length,
  );

  await likedQ.obliterate({ force: true }); // https://github.com/taskforcesh/bullmq/issues/430

  // https: github.com/OptimalBits/bull/issues/1731#issuecomment-639074663
  // bulkAll doesn't support repeateable jobs
  for (const user of users) {
    await likedQ.add(
      user.id,
      { userId: user.id },
      {
        // a job with duplicate id will not be added
        jobId: user.id,
        repeat: { every: minutesToMs(60) },
        backoff: {
          type: 'exponential',
          delay: minutesToMs(1),
        },
      },
    );
  }

  // repeateableJobs are started with delay, so run these manually at startup
  await likedQ.addBulk(
    users.map((user) => ({
      name: 'update_liked',
      data: {
        userId: user.id,
      },
    })),
  );

  console.log(
    'addUsersToLikedQueue -> non repeateable jobs created (only at startup):',
    await likedQ.getJobCounts(),
  );

  console.log('addUsersToLikedQueue -> done');
  global.__didRegisterLikedQ = true;
};
