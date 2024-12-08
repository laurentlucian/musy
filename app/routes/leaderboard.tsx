import { getTopLeaderboard } from "@lib/services/db/tracks.server";
import { getCacheControl } from "@lib/utils";
import { Suspense } from "react";
import { Leaderboard } from "~/components/domain/leaderboard";
import { Waver } from "~/components/icons/waver";
import type { Route } from "./+types/leaderboard";

export function headers(_: Route.HeadersArgs) {
  return {
    "Cache-Control": getCacheControl({ browser: "half-hour", cdn: "hour" }),
  };
}

export async function loader(_: Route.LoaderArgs) {
  return { leaderboard: getTopLeaderboard() };
}

export default function LeaderboardComponent({
  loaderData: { leaderboard },
}: Route.ComponentProps) {
  return (
    <ul className="flex w-full max-w-md flex-col gap-y-2">
      <Suspense fallback={<Waver />}>
        <Leaderboard leaderboard={leaderboard} />
      </Suspense>
    </ul>
  );
}
