import { TaskQueue } from "./queue.server";

declare global {
  var taskQueue: TaskQueue | undefined;
}

export async function initCron() {
  if (globalThis.taskQueue) {
    globalThis.taskQueue.stop();
  }

  globalThis.taskQueue = new TaskQueue();
}
