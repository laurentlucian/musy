import EventEmitter from 'node:events';
import type { Processor, WorkerOptions } from 'bullmq';
import { Queue as BullQueue, Worker } from 'bullmq';
import { minutesToMs } from '~/lib/utils';
import { redis } from './redis.server';

type RegisteredQueue = {
  queue: BullQueue;
  worker: Worker;
};

declare global {
  var __registeredQueues: Record<string, RegisteredQueue> | undefined;
}

EventEmitter.defaultMaxListeners = 50;

// biome-ignore lint/suspicious/noAssignInExpressions: it's okay
export const registeredQueues = global.__registeredQueues || (global.__registeredQueues = {});

export const Queue = <Payload>(
  name: string,
  handler: Processor<Payload>,
  workOpts?: Omit<WorkerOptions, 'connection'>,
): BullQueue<Payload> => {
  if (registeredQueues[name]) {
    return registeredQueues[name].queue;
  }

  // bullmq queues are the storage container managing jobs
  const queue = new BullQueue<Payload>(name, {
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: true,
    },
    connection: redis,
  });

  // workers are where the meat of our processing lives within a queue.
  // they reach out to our redis connection and pull jobs off the queue
  // in an order determined by factors such as job priority, delay, etc.
  const worker = new Worker<Payload>(name, handler, {
    limiter: { max: 3, duration: minutesToMs(1) },
    ...workOpts,
    connection: redis,
  });

  registeredQueues[name] = { queue, worker };

  return queue;
};
