import { createIdGenerator } from "ai";

type GenerateIdOptions = {
  prefix?: string;
  separator?: string;
  size?: number;
};

export function generateId(args?: GenerateIdOptions) {
  const { prefix, separator, size = 10 } = args ?? {};

  const generator = createIdGenerator({
    prefix,
    separator,
    size,
    alphabet: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  });

  return generator();
}

export function getMemoryStats() {
  const mem = process.memoryUsage();
  return {
    heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
    heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
    rss: Math.round(mem.rss / 1024 / 1024),
    external: Math.round(mem.external / 1024 / 1024),
  };
}
