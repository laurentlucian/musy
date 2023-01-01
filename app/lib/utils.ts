export const isProduction = process.env.NODE_ENV === 'production';

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

export const timeSince = (date: Date | null) => {
  if (!date) return '';
  const now = new Date().getTime();
  const seconds = Math.floor((now - new Date(date).getTime()) / 1000);

  let interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + 'y ago';
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + 'mo ago';
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + 'd ago';
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + 'h ago';
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + 'm ago';
  }
  // server hydration breaks when html is different from server (because this changes every second)
  // return Math.floor(seconds) + 's';
  return 'just now';
};

export const msToString = (ms: number) => {
  if (ms < 6000) {
    return `${ms / 1000}s`;
  } else if (ms < 3600000) {
    return `${Math.floor(ms / 60000)}m`;
  } else {
    return `${Math.floor(ms / 3600000)}h`;
  }
};
