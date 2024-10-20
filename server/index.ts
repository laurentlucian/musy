import debug from 'debug';
import { config } from 'dotenv';

import express from './express';

const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  config({
    path: '../.env',
  });
}

const gracefulShutdown = async (signal: NodeJS.Signals) => {
  console.log(`received ${signal}, closing server...`);
  // for (const queue of QUEUES) {
  //   await queue.close();
  // }

  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

async function main() {
  // void cleanup();
  debug.enable('*Q*');

  await express();
  // await hono();

  // betterLogging.default(console);
}

export default main().catch((err) => {
  console.error('main--> error', err);
  process.exit(1);
});
