import { BaseScheduler } from "../base.server";
import { syncFeed } from "./feed.server";

export class FeedScheduler extends BaseScheduler {
  constructor() {
    super("feed");
  }

  protected async execute(): Promise<void> {
    await syncFeed();
  }
}
