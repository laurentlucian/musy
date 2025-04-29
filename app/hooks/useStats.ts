import { useEventSource } from "remix-utils/sse/react";

export interface Stats {
  played: number;
  minutes: number;
  artists: Record<string, number>;
  albums: Record<string, number>;
  songs: Record<string, number>;
}

export function useStats(userId: string, year: number) {
  const data = useEventSource(`/resources/stats/${userId}?year=${year}`, {
    event: "stats",
  });

  if (!data) return null;

  return JSON.parse(data) as Stats;
}
