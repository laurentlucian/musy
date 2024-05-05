import type { RedisOptions, Redis as RedisType } from 'ioredis';
import Redis from 'ioredis';
import { singleton } from '../singleton.server';

const redisOptions: RedisOptions = {
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
};

const redis = singleton('redis', () => {
  if (!process.env.REDIS_URL) throw new Error('Missing REDIS_URL env');

  if (process.env.NODE_ENV !== 'production') {
    return new Redis(process.env.REDIS_URL, redisOptions);
  }

  if (!process.env.REDIS_PASSWORD) throw new Error('Missing REDIS_PASSWORD env');

  return new Redis(process.env.REDIS_URL, {
    ...redisOptions,
    host: process.env.REDIS_URL,
    family: 6,
    password: process.env.REDIS_PASSWORD,
  });
});

export { redis };
