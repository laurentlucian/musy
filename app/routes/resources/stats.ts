import { prisma } from "@lib/services/db.server";
import { log } from "@lib/utils";
import { endOfYear, setYear, startOfYear } from "date-fns";
import { data } from "react-router";
import { eventStream } from "remix-utils/sse/server";
import type { Route } from "./+types/stats";

export const TAKE = 3000;
const TIMEOUT = {
  INITIAL: 1000, // 1s
  UPDATES: 30_000, // 30s
};

export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = params.userId;

  if (!userId) return data("User ID is required", { status: 400 });
  const url = new URL(request.url);
  const year = +(url.searchParams.get("year") ?? "2025");
  const date = setYear(new Date(), year);

  const take = TAKE;
  let skip = +(url.searchParams.get("skip") ?? "0");

  let timeoutId: NodeJS.Timeout | null = null;

  return eventStream(request.signal, function setup(send) {
    async function run() {
      const played = await prisma.recentSongs.findMany({
        orderBy: {
          playedAt: "desc",
        },
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

        send({ event: "stats", data: JSON.stringify(played) });
        log(`skipped ${skip} songs & sent ${played.length}`, "stats");
      } else {
        log(`skipped ${skip} songs & no new songs found`, "stats");
      }

      const next = played.length < take ? TIMEOUT.UPDATES : TIMEOUT.INITIAL;
      log(`next update in ${next / 1000}s`, "stats");
      timeoutId = setTimeout(run, next);
    }

    run();
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  });
}
