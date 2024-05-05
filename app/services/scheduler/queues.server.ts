import { feedQ } from '~/services/scheduler/jobs/feed.server';
import { userQ } from '~/services/scheduler/jobs/user.server';
import { followQ } from '~/services/scheduler/jobs/user/follow.server';
import { likedQ } from '~/services/scheduler/jobs/user/liked.server';
import { playlistQ } from '~/services/scheduler/jobs/user/playlist.server';
import { profileQ } from '~/services/scheduler/jobs/user/profile.server';
import { recentQ } from '~/services/scheduler/jobs/user/recent.server';
import { topQ } from '~/services/scheduler/jobs/user/top.server';

export const QUEUES = [feedQ, userQ, followQ, likedQ, profileQ, playlistQ, recentQ, topQ];

export async function cleanup() {
  for (const queue of QUEUES) {
    const failedJobs = await queue.getFailed();
    const completedJobs = await queue.getCompleted();
    const delayedJobs = await queue.getDelayed();
    const removableJobs = failedJobs.concat(completedJobs).concat(delayedJobs);

    for (const job of removableJobs) {
      await job.remove();
    }
  }
}
