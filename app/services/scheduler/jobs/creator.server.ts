import debug from 'debug';
import { isProduction, minutesToMs } from '~/lib/utils';
import { getAllUsersId } from '~/services/prisma/users.server';
import { createFeedQ } from '../creators/feedQ.server';
import { followQ } from '../jobs/user/follow.server';
import { likedQ } from '../jobs/user/liked.server';
import { playlistQ } from '../jobs/user/playlist.server';
import { profileQ } from '../jobs/user/profile.server';
import { recentQ } from '../jobs/user/recent.server';
import { topQ } from '../jobs/user/top.server';
import { createPlaybackQ } from './playback/creator.server';
import { userQ } from './user.server';
const debugQCreator = debug('QCreator');

export default async function createQueues() {
  debugQCreator('creating Qs...');

  await createPlaybackQ()
    .catch(debugQCreator)
    .then(() => debugQCreator('playback_creator added'));

  void createFeedQ();

  if (!isProduction) {
    await userQ.add(
      'update_user',
      { userId: '1295028670' },
      { repeat: { every: minutesToMs(10) } },
    );

    debugQCreator(`1 Q created`);
    return;
  }

  const users = await getAllUsersId();

  for (const userId of users) {
    const options = {
      backoff: {
        delay: minutesToMs(1),
        type: 'exponential',
      },
      removeOnComplete: true,
      removeOnFail: true,
    };

    await Promise.all([
      recentQ.add(
        'update_recent',
        { userId },
        {
          ...options,
          jobId: userId,
          repeat: { every: minutesToMs(10) },
        },
      ),
      likedQ.add(
        'update_liked',
        { userId },
        {
          ...options,
          jobId: userId,
          repeat: { every: minutesToMs(1440) },
        },
      ),
      followQ.add(
        'update_follow',
        { userId },
        {
          ...options,
          jobId: userId,
          repeat: { every: minutesToMs(1000) },
        },
      ),
      profileQ.add(
        'update_profile',
        { userId },
        {
          ...options,
          jobId: userId,
          repeat: { every: minutesToMs(60) },
        },
      ),
      playlistQ.add(
        'update_playlist',
        { userId },
        {
          ...options,
          jobId: userId,
          repeat: { every: minutesToMs(500) },
        },
      ),
      topQ.add(
        'update_top',
        { userId },
        {
          ...options,
          jobId: userId,
          repeat: { every: minutesToMs(700) },
        },
      ),
    ]).catch(debugQCreator);

    debugQCreator(`${users.length} Qs created`);
  }
}
