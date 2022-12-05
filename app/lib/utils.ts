export const notNull = <T>(val: T | null): val is T => {
  return val !== null;
};

export const minutesToMs = (minutes: number) => minutes * 60 * 1000;
