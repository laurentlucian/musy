import { TaskQueue } from "./queue.server";

declare global {
  var taskQueue: TaskQueue | undefined;
}

export async function initCron() {
  console.log("\x1b[33m%s\x1b[0m", "initializing croner");
  if (globalThis.taskQueue) {
    globalThis.taskQueue.stop();
  }

  globalThis.taskQueue = new TaskQueue();
}
