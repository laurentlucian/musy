import { prisma } from "@lib/services/db.server";
import { log } from "@lib/utils";
import { endOfYear, setYear, startOfYear } from "date-fns";
import { data } from "react-router";
import { eventStream } from "remix-utils/sse/server";
import { interval } from "remix-utils/timers";
import type { Route } from "./+types/stats";

export const TAKE = 2000;
const TIMEOUT = {
  INITIAL: 1000, // 1s
  UPDATES: 30_000, // 30s
};

// bun not triggering abort event
// https://github.com/oven-sh/bun/issues/17591
export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = params.userId;

  if (!userId) return data("User ID is required", { status: 400 });
  log(`loading for ${userId}`, "stats");

  const url = new URL(request.url);
  const year = +(url.searchParams.get("year") ?? "2025");
  const date = setYear(new Date(), year);
  const take = TAKE;
  let skip = +(url.searchParams.get("skip") ?? "0");

  return eventStream(request.signal, function setup(send) {
    async function run() {
      try {
        // use dynamic intervals based on query results
        for await (const _ of interval(TIMEOUT.INITIAL, {
          signal: request.signal,
        })) {
          const played = await prisma.recentSongs.findMany({
            orderBy: { playedAt: "desc" },
            where: {
              userId,
              playedAt: {
                gte: startOfYear(date),
                lte: endOfYear(date),
              },
            },
            take,
            skip,
            select: {
              track: {
                select: {
                  uri: true,
                  name: true,
                  artist: true,
                  albumName: true,
                  duration: true,
                },
              },
            },
          });

          if (played.length) {
            skip += played.length;
            send({
              event: "stats",
              data: JSON.stringify(calculateStats(played)),
            });
            log(`sent ${played.length} songs for ${userId}`, "stats");
          }

          // adjust interval based on result
          const nextDelay =
            played.length < take ? TIMEOUT.UPDATES : TIMEOUT.INITIAL;
          log(`next update in ${nextDelay / 1000}s`, "stats");

          // if we need to slow down, wait for the difference
          if (nextDelay > TIMEOUT.INITIAL) {
            await new Promise((resolve) =>
              setTimeout(resolve, nextDelay - TIMEOUT.INITIAL),
            );
          }
        }
      } catch (error) {
        log(`error in stats stream: ${error}`, "stats");
      }
    }

    run();

    return () => {
      log(`cleaned up stats stream for ${userId}`, "stats");
    };
  });
}

export type Stats = {
  played: number;
  minutes: number;
  artists: Record<string, number>;
  albums: Record<string, number>;
  songs: Record<string, number>;
};

export function calculateStats(
  played: {
    track: {
      name: string;
      albumName: string;
      artist: string;
      duration: number;
    };
  }[],
) {
  const minutes = played.reduce(
    (acc, curr) => acc + curr.track.duration / 60_000,
    0,
  );

  const artists = played.reduce(
    (acc, { track }) => {
      acc[track.artist] = (acc[track.artist] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const albums = played.reduce(
    (acc, { track }) => {
      acc[track.albumName] = (acc[track.albumName] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const songs = played.reduce(
    (acc, { track }) => {
      acc[track.name] = (acc[track.name] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return { minutes, artists, albums, songs, played: played.length };
}
