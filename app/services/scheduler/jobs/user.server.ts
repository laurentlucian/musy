import debug from 'debug';

import { minutesToMs } from '~/lib/utils';
import { prisma } from '~/services/db.server';
import { Queue } from '~/services/scheduler/queue.server';
import { getSpotifyClient } from '~/services/spotify.server';

import { createPlaybackQ } from './playback/creator.server';
import { followQ } from './user/follow.server';
import { likedQ } from './user/liked.server';
import { playlistQ } from './user/playlist.server';
import { profileQ } from './user/profile.server';
import { recentQ } from './user/recent.server';

const debugUserQ = debug('userQ');
export const debugStartUp = debugUserQ.extend('startUp');
export const debugLikedQ = debugUserQ.extend('likedQ');
export const debugFollowQ = debugUserQ.extend('followQ');
export const debugProfileQ = debugUserQ.extend('profileQ');
export const debugRecentQ = debugUserQ.extend('recentQ');
export const debugPlaylistQ = debugUserQ.extend('playlistQ');

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

    await Promise.all([
      recentQ.add('update_recent', { userId }),
      likedQ.add('update_liked', { userId }),
      followQ.add('update_follow', { userId }),
      profileQ.add('update_profile', { userId }),
      playlistQ.add('update_playlist', { userId }),
    ]);

    debugUserQ('completed');

    await createPlaybackQ()
      .catch(debugUserQ)
      .then(() => debugUserQ('playback_creator added'));
  },
  {
    limiter: {
      duration: minutesToMs(1),
      max: 1,
    },
  },
);
