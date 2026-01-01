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

export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: { attempts?: number; delay?: number },
): Promise<T> {
  const { attempts = 3, delay = 500 } = options ?? {};
  let lastError: unknown;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < attempts - 1) {
        const backoffDelay = delay * 2 ** i;
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      }
    }
  }

  throw lastError;
}
