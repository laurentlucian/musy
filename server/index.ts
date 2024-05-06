import { QueueEvents } from 'bullmq';
import debug from 'debug';
import { config } from 'dotenv';
import createQueues from '~/services/scheduler/jobs/creator.server';
import { QUEUES } from '~/services/scheduler/queues.server';
import { redis } from '~/services/scheduler/redis.server';
import express from './express';

const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  config({
    path: '../.env',
  });
}

const gracefulShutdown = async (signal: NodeJS.Signals) => {
  console.log(`received ${signal}, closing server...`);
  for (const queue of QUEUES) {
    await queue.close();
  }

  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

const queueEvents = new QueueEvents('allQs', {
  connection: redis,
});

queueEvents.on('waiting', ({ jobId }) => {
  console.log(`A job with ID ${jobId} is waiting`);
});

queueEvents.on('active', ({ jobId, prev }) => {
  console.log(`Job ${jobId} is now active; previous status was ${prev}`);
});

queueEvents.on('completed', ({ jobId, returnvalue }) => {
  console.log(`${jobId} has completed and returned ${returnvalue}`);
});

queueEvents.on('failed', ({ jobId, failedReason }) => {
  console.log(`${jobId} has failed with reason ${failedReason}`);
});

async function main() {
  // void cleanup();
  await createQueues();
  debug.enable('*Q*');

  await express();
  // await hono();

  // betterLogging.default(console);
}

export default main().catch((err) => {
  console.error('main--> error', err);
  process.exit(1);
});
