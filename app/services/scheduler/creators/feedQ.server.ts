import debug from 'debug';

import { minutesToMs } from '~/lib/utils';

import { feedQ } from '../jobs/feed.server';
import { timestampToDate } from './userQ.server';

const debugFeedQCreator = debug('feedQCreator');

export const createFeedQ = async () => {
  debugFeedQCreator('creating feedQ...');

  const getFeedQ = async () =>
    (await feedQ.getRepeatableJobs()).map((j) => [timestampToDate(j.next), j.key]);

  await feedQ.pause().catch(debugFeedQCreator); // pause all jobs before obliterating
  await feedQ.obliterate({ force: true }).catch(() => debugFeedQCreator('obliterated userQ')); // https://github.com/taskforcesh/bullmq/issues/430
  const feedQs = await getFeedQ();

  if (feedQs.length === 0) {
    // await feedQ.add('update_feed', null);
    await feedQ.add('update_feed', null, {
      backoff: {
        delay: minutesToMs(1),
        type: 'exponential',
      },
      removeOnComplete: true,
      removeOnFail: true,
      repeat: { every: minutesToMs(1) },
    });
    debugFeedQCreator('added 1 repeateable feed job');
  }
};
