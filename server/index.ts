import debug from 'debug';
import { config } from 'dotenv';
import { initCron } from '~/services/scheduler/croner.server';
import express from './express';

const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  config({
    path: '../.env',
  });
}

const gracefulShutdown = async (signal: NodeJS.Signals) => {
  console.log(`received ${signal}, closing server...`);

  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

async function main() {
  debug.enable('*Q*');
  await initCron();
  await express();
}

export default main().catch((err) => {
  console.error('main--> error', err);
  process.exit(1);
});
