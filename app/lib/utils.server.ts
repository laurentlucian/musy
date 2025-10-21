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
