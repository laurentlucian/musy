import type { Redis as RedisType, RedisOptions } from 'ioredis';
import Redis from 'ioredis';

if (!process.env.REDIS_URL) {
  throw new Error('Missing REDIS_URL env');
}

let redis: RedisType;

declare global {
  var __redis: RedisType | undefined;
}

const redisOptions: RedisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the Redis with every change either
if (process.env.NODE_ENV === 'production') {
  if (!process.env.REDIS_PASSWORD) {
    throw new Error('Missing REDIS_URL env');
  }

  const _redisOption: RedisOptions = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    port: 6379,
    family: 6,
    host: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD,
  };
  redis = new Redis(process.env.REDIS_URL, _redisOption);
} else {
  if (!global.__redis) {
    global.__redis = new Redis(process.env.REDIS_URL, redisOptions);
  }
  redis = global.__redis;
}

export { redis };
