import { getAllUsersId } from "~/services/prisma/users.server";
import { BaseScheduler } from "../base.server";
import { syncUserFollow } from "../scripts/user/follow.server";
import { syncUserLiked } from "../scripts/user/liked.server";
import { syncUserPlaylist } from "../scripts/user/playlist.server";
import { syncUserProfile } from "../scripts/user/profile.server";
import { syncUserRecent } from "../scripts/user/recent.server";
import { syncUserTop } from "../scripts/user/top.server";

const SYNC_ORDER = [
  "profile",
  "recent",
  "liked",
  "follow",
  "playlist",
  "top",
] as const;
type SyncType = (typeof SYNC_ORDER)[number];

class UserTaskScheduler extends BaseScheduler {
  private currentTaskIndex = 0;
  private readonly userId: string;
  private readonly syncFunctions: Record<
    SyncType,
    (userId: string) => Promise<void>
  > = {
    profile: syncUserProfile,
    recent: syncUserRecent,
    liked: syncUserLiked,
    follow: syncUserFollow,
    playlist: syncUserPlaylist,
    top: syncUserTop,
  };

  constructor(userId: string) {
    super(`user-${userId}`);
    this.userId = userId;
  }

  protected async execute(): Promise<void> {
    const taskType = SYNC_ORDER[this.currentTaskIndex];
    this.debugger(`Executing task: ${taskType}`);

    try {
      await this.syncFunctions[taskType](this.userId);
      this.debugger(`Completed task: ${taskType}`);
    } catch (error) {
      this.debugger(`Failed task ${taskType}:`, error);
    }

    this.currentTaskIndex = (this.currentTaskIndex + 1) % SYNC_ORDER.length;
  }
}

export class UserSyncScheduler extends BaseScheduler {
  private userSchedulers: Map<string, UserTaskScheduler> = new Map();

  constructor() {
    super("user-sync");
  }

  protected async execute(): Promise<void> {
    const users = await getAllUsersId();

    this.stopAllUserSchedulers();

    users.forEach((userId, index) => {
      const baseDelay = index * 60 * 1000; // 1 minute stagger between users
      this.initUserScheduler(userId, baseDelay);
    });
  }

  private initUserScheduler(userId: string, _baseDelay: number) {
    const scheduler = new UserTaskScheduler(userId);
    scheduler.start("*/10 * * * *", true);
    this.userSchedulers.set(userId, scheduler);
  }

  private stopAllUserSchedulers() {
    for (const scheduler of this.userSchedulers.values()) {
      scheduler.stop();
    }
    this.userSchedulers.clear();
  }

  public addUserSchedulers(userId: string) {
    this.initUserScheduler(userId, 0);
  }

  public removeUserSchedulers(userId: string) {
    const scheduler = this.userSchedulers.get(userId);
    if (scheduler) {
      scheduler.stop();
      this.userSchedulers.delete(userId);
    }
  }
}
