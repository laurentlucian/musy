import debug from 'debug';

import { msToString } from '~/lib/utils';
import { prisma } from '~/services/db.server';
import { Queue } from '~/services/scheduler/queue.server';
import { getSpotifyClient } from '~/services/spotify.server';

import { upsertPlayback } from './playback/utils.server';

const debugPlaybackQ = debug('playbackQ');
export const debugCreatorQ = debugPlaybackQ.extend('creatorQ');

export const playbackQ = Queue<{ userId: string }>('update_playback', async (job) => {
  const { userId } = job.data;
  debugPlaybackQ('job starting...', userId);

  const { spotify } = await getSpotifyClient(userId);

  if (!spotify) {
    debugPlaybackQ(`exiting; spotify client not found`);
    return null;
  }

  const { body: playback } = await spotify.getMyCurrentPlaybackState();
  // getPlaybackContext(playback);

  if (!playback || !playback.is_playing) {
    debugPlaybackQ('exiting; user not playing, will be cleaned up on playbackCreator');
    return null;
  }
  const { item: track, progress_ms } = playback;

  if (!track || track.type !== 'track' || !progress_ms) {
    debugPlaybackQ('exiting; user not playing a track, will be cleaned up on playbackCreator');
    return null;
  }

  debugPlaybackQ('repeat state', playback.repeat_state);
  if (playback.repeat_state === 'track') {
    debugPlaybackQ('on repeat -- will check again in 5 minutes', track.name, userId);
    await playbackQ.add(
      'update_playback',
      { userId },
      {
        delay: 1000 * 60 * 5,
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
    debugPlaybackQ('completed', userId);
    return null;
  }
  const current = await prisma.playback.findUnique({ where: { userId } });
  const isSameTrack = current?.trackId === track.id;
  const remaining = track.duration_ms - progress_ms;
  debugPlaybackQ(track.name, isSameTrack ? 'sameTrack' : 'newTrack');

  await upsertPlayback(userId, playback);
  debugPlaybackQ('playback upserted');

  const extraDelay = isSameTrack ? 1000 * 5 : 1000 * 1;
  const delay = remaining + extraDelay;
  await playbackQ.add(
    'update_playback',
    { userId },
    {
      delay,
      removeOnComplete: true,
      removeOnFail: true,
    },
  );

  debugPlaybackQ('completed', userId, 'will check again in', msToString(delay));
});
