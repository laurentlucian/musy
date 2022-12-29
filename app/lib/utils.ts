export const notNull = <T>(val: T | null): val is T => {
  return val !== null;
};

export const minutesToMs = (minutes: number) => minutes * 60 * 1000;
export const secondsToMinutes = (seconds: number) => seconds / 60 / 60;
export const msToHours = (ms: number) => ms / 1000 / 60 / 60;

export const lessThanAWeek = (date: Date) => {
  const aWeekAgo = new Date();
  aWeekAgo.setDate(aWeekAgo.getDate() - 7);

  return date > aWeekAgo;
};
export const lessThanADay = (date: Date) => {
  const aDayAgo = new Date();
  aDayAgo.setDate(aDayAgo.getDate() - 1);

  return date > aDayAgo;
};
