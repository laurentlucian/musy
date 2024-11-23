import { FeedScheduler } from './jobs/feed.scheduler';
import { UserSyncScheduler } from './jobs/user.scheduler';

declare global {
  var schedulers: {
    feed?: FeedScheduler;
    userSync?: UserSyncScheduler;
  };
}

if (!globalThis.schedulers) {
  globalThis.schedulers = {};
}

export async function initCron() {
  if (globalThis.schedulers.feed) {
    globalThis.schedulers.feed.stop();
  }
  if (globalThis.schedulers.userSync) {
    globalThis.schedulers.userSync.stop();
  }

  const feedScheduler = new FeedScheduler();
  feedScheduler.start('*/5 * * * *', true);
  globalThis.schedulers.feed = feedScheduler;

  const userSyncScheduler = new UserSyncScheduler();
  userSyncScheduler.start('0 * * * *', true);
  globalThis.schedulers.userSync = userSyncScheduler;
}
