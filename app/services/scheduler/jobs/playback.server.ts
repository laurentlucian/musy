import { Cron } from 'croner';
import debug from 'debug';
import { msToString, notNull } from '~/lib/utils';
import { prisma } from '~/services/db.server';
import { getAllUsersId } from '~/services/prisma/users.server';
import { getSpotifyClient } from '~/services/spotify.server';
import { getPlaybackState, upsertPlayback } from '../utils.server';

const debugPlaybackQ = debug('playbackQ');
export const debugCreatorQ = debugPlaybackQ.extend('creatorQ');

export async function syncPlaybacks() {
  debugCreatorQ('starting...');

  const users = await getAllUsersId();
  const playbacks = await Promise.all(users.map((userId) => getPlaybackState(userId)));
  const active = playbacks.filter((u) => notNull(u.playback));

  debugCreatorQ('users active', active.length, active.map(({ id }) => id).join(', '));
  // await clearDuplicatePlaybackJobs();

  for (const { id: userId, playback } of active) {
    if (!playback) continue;
    const { item: track, progress_ms } = playback;
    const current = await prisma.playback.findUnique({ where: { userId } });
    const isSameTrack = current?.trackId === track?.id;
    if (isSameTrack) debugCreatorQ('same track', userId);
    if (!track || track.type !== 'track' || !progress_ms || isSameTrack) continue;
    debugCreatorQ('new track', userId);

    await upsertPlayback(userId, playback).catch((e) => debugCreatorQ('prisma update failed: ', e));
    debugCreatorQ('prisma updated');
    const remaining = track.duration_ms - progress_ms;

    // Schedule a new cron job for this user
    schedulePlaybackCheck(userId, remaining);

    debugCreatorQ('created playbackQ job with delay', msToString(remaining));

    // Queue pending (waiting for playback to start) songs from musy
    await queuePendingSongs(userId);
  }

  // handleInactiveUsers(playbacks.filter((u) => !notNull(u.playback)));

  debugCreatorQ('completed');
}

function schedulePlaybackCheck(userId: string, delay: number) {
  const job = new Cron(
    new Date(Date.now() + delay),
    () => {
      checkUserPlayback(userId);
    },
    {
      maxRuns: 1,
      catch: (error) => {
        console.error(`Error in playback check for user ${userId}:`, error);
        // Attempt to reschedule in case of error
        schedulePlaybackCheck(userId, 60000); // Try again in 1 minute
      },
    },
  );

  // If you want to be able to cancel jobs later, store them:
  // if (!globalThis.playbackJobs) globalThis.playbackJobs = new Map();
  // globalThis.playbackJobs.set(userId, job);
}

async function checkUserPlayback(userId: string) {
  const { spotify } = await getSpotifyClient(userId);
  if (!spotify) {
    debugCreatorQ(`exiting; spotify client not found for user ${userId}`);
    return;
  }

  const { body: playback } = await spotify.getMyCurrentPlaybackState();

  if (!playback || !playback.is_playing) {
    debugCreatorQ('user not playing, will be cleaned up on next createPlaybackQ run');
    return;
  }

  const { item: track, progress_ms } = playback;

  if (!track || track.type !== 'track' || !progress_ms) {
    debugCreatorQ('user not playing a track, will be cleaned up on next createPlaybackQ run');
    return;
  }

  await upsertPlayback(userId, playback);
  debugCreatorQ('playback upserted for user', userId);

  const remaining = track.duration_ms - progress_ms;
  let delay: number;

  if (playback.repeat_state === 'track') {
    delay = 1000 * 60 * 5; // Check again in 5 minutes for repeated tracks
    debugCreatorQ('track on repeat, will check again in 5 minutes');
  } else {
    delay = remaining + 1000; // Add 1 second buffer
    debugCreatorQ('will check again at the end of the track');
  }

  // Schedule the next check
  schedulePlaybackCheck(userId, delay);

  debugCreatorQ('completed check for', userId, 'will check again in', msToString(delay));
}

async function queuePendingSongs(userId: string) {
  const queue = await prisma.queue.findMany({
    include: {
      track: { select: { uri: true } },
    },
    orderBy: { createdAt: 'asc' },
    where: { ownerId: userId, pending: true },
  });

  if (queue.length) {
    debugCreatorQ('pending queue', queue.length);
    const { spotify } = await getSpotifyClient(userId);
    if (spotify) {
      for (const { track } of queue) {
        const { uri } = track;
        await spotify.addToQueue(uri);
        debugCreatorQ('queued track', uri);
      }
      await prisma.queue.updateMany({
        data: { pending: false },
        where: { id: { in: queue.map((q) => q.id) } },
      });
      debugCreatorQ('updated queues to not pending');
    }
  }
}
