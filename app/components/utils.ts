import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const notNull = <T>(val: T | null): val is T => {
  return val !== null;
};

export const msToString = (ms: number) => {
  if (ms < 6000) {
    return `${ms / 1000}s`;
  }
  if (ms < 3600000) {
    return `${Math.floor(ms / 60000)}m`;
  }
  return `${Math.floor(ms / 3600000)}h`;
};

export const secondsToMinutes = (seconds: number) => seconds / 60 / 60;

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

export const timeSince = (date: Date | null, type?: string) => {
  if (!date) return "";
  const now = Date.now();
  const seconds = Math.floor((now - new Date(date).getTime()) / 1000);

  let interval = seconds / 31536000;
  const suffix = type === "minimal" ? "" : " ago";

  if (interval > 1) {
    return `${Math.floor(interval)}y${suffix}`;
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return `${Math.floor(interval)}mo${suffix}`;
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return `${Math.floor(interval)}d${suffix}`;
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return `${Math.floor(interval)}h${suffix}`;
  }
  interval = seconds / 60;
  if (interval > 1) {
    return `${Math.floor(interval)}m${suffix}`;
  }
  // server hydration breaks when html is different from server (because this changes every second)
  // return Math.floor(seconds) + 's';
  return "now";
};

export const timeBetween = ({
  endDate,
  startDate,
}: {
  endDate?: Date;
  startDate?: Date;
}) => {
  if (!endDate || !startDate) return "";
  const diffInMilliseconds = Math.abs(endDate.getTime() - startDate.getTime());

  if (diffInMilliseconds < 1000 * 60 * 60) {
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    return `${diffInMinutes}m`;
  }
  const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
  return `${diffInHours}h`;
};

export const shortenUsername = (username?: string) => {
  if (!username) return "anon";

  const [first, second = ""] = username.split(/[\s.]+/);
  return second.length > 4 || first.length >= 6
    ? first
    : [first, second].join(" ");
};

export const decodeHtmlEntity = (str?: string | null) => {
  return str?.replace(/&#x([0-9A-Fa-f]+);/g, (_, dec) => {
    return String.fromCharCode(Number.parseInt(dec, 16));
  });
};

export function ellipsis(str: string, maxLength: number) {
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
}

type Duration =
  | "minute"
  | "half-minute"
  | "hour"
  | "half-hour"
  | "day"
  | "half-day"
  | "week"
  | "half-week"
  | "year"
  | "half-year";

function durationToSeconds(duration: Duration): number {
  switch (duration) {
    case "half-minute":
      return 30;
    case "minute":
      return 60;
    case "half-hour":
      return 30 * 60;
    case "hour":
      return 60 * 60;
    case "half-day":
      return 12 * 60 * 60;
    case "day":
      return 24 * 60 * 60;
    case "half-week":
      return 3.5 * 24 * 60 * 60;
    case "week":
      return 7 * 24 * 60 * 60;
    case "half-year":
      return 182.5 * 24 * 60 * 60;
    case "year":
      return 365 * 24 * 60 * 60;
  }
}

export function getCacheControl(args: { browser: Duration; cdn: Duration }) {
  return `max-age=${durationToSeconds(args.browser)}, s-maxage=${durationToSeconds(args.cdn)}`;
}

export function logError(error: unknown, label?: string) {
  console.error(`${(label ?? "error")}:`, error);
}

export function log(message: string, label?: string) {
  console.log(`${(label ?? "log")}: ${message}`);
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
