import debug from 'debug';
import { config } from 'dotenv';
import { createFeedQ } from '~/services/scheduler/creators/feedQ.server';
import { createUserQ } from '~/services/scheduler/creators/userQ.server';
import express from './express';

config({
  path: '../.env',
});

async function main() {
  await createUserQ();
  await createFeedQ();
  debug.enable('*Q*');

  await express();

  // betterLogging.default(console);
  // await hono();
}

export default main().catch((err) => {
  console.error('main--> error', err);
  process.exit(1);
});
