import { customAlphabet } from "nanoid";

type GenerateIdOptions = {
  prefix?: string;
  separator?: string;
  size?: number;
};

const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function generateId(args?: GenerateIdOptions) {
  const { prefix, separator, size = 10 } = args ?? {};

  const generator = customAlphabet(alphabet, size);
  const id = generator();

  if (prefix) {
    return separator ? `${prefix}${separator}${id}` : `${prefix}${id}`;
  }

  return id;
}
