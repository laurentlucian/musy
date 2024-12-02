import { Cron } from "croner";
import debug from "debug";
import { getAllUsersId } from "server/services/prisma/users.server";

const log = debug("musy:queue");

type SyncAction =
  | "profile"
  | "recent"
  | "liked"
  | "follow"
  | "playlist"
  | "top";

type Task = {
  type: "sync" | "playback" | "feed";
  userId?: string;
  action?: string;
};

const SCHEDULE_CONFIG = {
  QUEUE_CHECK_INTERVAL: 1, // in minutes
  FEED_INTERVAL: 5,
  PLAYBACK_INTERVAL: 1,
  SYNC_INTERVALS: {
    profile: 60,
    recent: 5,
    liked: 15,
    follow: 60,
    playlist: 30,
    top: 120,
  } as const,
  TASK_DELAY: 10000, // in milliseconds
} as const;

const ENABLED_SYNC_TASKS: Record<SyncAction, boolean> = {
  profile: true,
  recent: true,
  liked: true,
  follow: false,
  playlist: false,
  top: false,
};

export class TaskQueue {
  private queue: Task[] = [];
  private processing = false;
  private cron: Cron | null = null;
  private lastRun: Record<string, number> = {};

  constructor() {
    this.initCron();
  }

  private initCron() {
    this.cron = new Cron("*/1 * * * *", async () => {
      if (this.queue.length === 0) {
        await this.populateQueue();
      }
      if (!this.processing) {
        await this.processNextTask();
      }
    });
  }

  private async populateQueue() {
    log("populating queue...");
    const users = await getAllUsersId();

    this.queue.push({ type: "feed" });

    for (const userId of users) {
      this.queue.push({ type: "playback", userId });

      for (const [action, enabled] of Object.entries(ENABLED_SYNC_TASKS)) {
        if (enabled) {
          this.queue.push({
            type: "sync",
            userId,
            action: action as SyncAction,
          });
        }
      }
    }

    log(
      `queue populated with ${this.queue.length} tasks`,
      `enabled tasks: ${Object.entries(ENABLED_SYNC_TASKS)
        .filter(([_, enabled]) => enabled)
        .map(([action]) => action)
        .join(", ")}`,
    );
  }

  private async processNextTask() {
    if (this.queue.length === 0 || this.processing) return;

    this.processing = true;
    const task = this.queue.shift();

    try {
      if (task) {
        const taskKey = task.userId
          ? `${task.type}_${task.action || ""}_${task.userId}`
          : task.type;

        await this.executeTask(task);
        this.lastRun[taskKey] = Date.now();
      }

      // Sleep between tasks
      await new Promise((resolve) =>
        setTimeout(resolve, SCHEDULE_CONFIG.TASK_DELAY),
      );
    } catch (error) {
      log(`error processing task: ${error}`);
    } finally {
      this.processing = false;
      if (this.queue.length > 0) {
        await this.processNextTask();
      }
    }
  }

  private async executeTask(task: Task) {
    switch (task.type) {
      case "feed":
        await this.processFeedTask();
        break;
      case "sync":
        if (task.userId && task.action) {
          await this.processSyncTask(task.userId, task.action);
        }
        break;
      case "playback":
        if (task.userId) {
          await this.processPlaybackTask(task.userId);
        }
        break;
    }
  }

  private async processFeedTask() {
    log("processing feed task");
    const { syncFeed } = await import("./scripts/feed.server");
    await syncFeed();
  }

  private async processSyncTask(userId: string, action: string) {
    log(`processing ${action} sync for user ${userId}`);

    const syncFunctions: Record<string, (userId: string) => Promise<void>> = {
      profile: (await import("./scripts/user/profile.server")).syncUserProfile,
      recent: (await import("./scripts/user/recent.server")).syncUserRecent,
      liked: (await import("./scripts/user/liked.server")).syncUserLiked,
      follow: (await import("./scripts/user/follow.server")).syncUserFollow,
      playlist: (await import("./scripts/user/playlist.server"))
        .syncUserPlaylist,
      top: (await import("./scripts/user/top.server")).syncUserTop,
    };

    await syncFunctions[action](userId);
  }

  private async processPlaybackTask(userId: string) {
    log(`processing playback for user ${userId}`);
    const { syncPlaybacks } = await import("./scripts/user/playback.server");
    await syncPlaybacks();
  }

  public stop() {
    this.cron?.stop();
    this.queue = [];
    this.processing = false;
  }
}
