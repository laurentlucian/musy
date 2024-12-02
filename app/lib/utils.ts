import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isProduction = process.env.NODE_ENV === "production";

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

export const timeSince = (date: Date | null, type?: string) => {
  if (!date) return "";
  const now = new Date().getTime();
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
}: { endDate?: Date; startDate?: Date }) => {
  if (!endDate || !startDate) return "";
  const diffInMilliseconds = Math.abs(endDate.getTime() - startDate.getTime());

  if (diffInMilliseconds < 1000 * 60 * 60) {
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    return `${diffInMinutes}m`;
  }
  const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
  return `${diffInHours}h`;
};

export const iosSplashScreens = [
  {
    href: "/splash_screens/iPhone_14_Pro_Max_landscape.png",
    media:
      "screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
    rel: "apple-touch-startup-image",
  },
  {
    href: "/splash_screens/iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_portrait.png",
    media:
      "screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    rel: "apple-touch-startup-image",
  },
  {
    href: "/splash_screens/iPhone_11_Pro_Max__iPhone_XS_Max_portrait.png",
    media:
      "screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)",
    rel: "apple-touch-startup-image",
  },
];

export const shortenUsername = (username?: string) => {
  if (!username) return "anon";

  const [first, second = ""] = username.split(/[\s.]+/);
  return second.length > 4 || first.length >= 6
    ? first
    : [first, second].join(" ");
};

export const getCacheControl = (minutes = 1) => ({
  "Cache-Control": `private, stale-while-revalidate, max-age=${minutes * 60}`,
});

export const decodeHtmlEntity = (str?: string | null) => {
  return str?.replace(/&#x([0-9A-Fa-f]+);/g, (_, dec) => {
    return String.fromCharCode(Number.parseInt(dec, 16));
  });
};
