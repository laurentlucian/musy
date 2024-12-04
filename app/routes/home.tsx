import { Suspense } from "react";
import { Leaderboard } from "~/components/domain/leaderboard";

import { Waver } from "~/components/icons/waver";
import { getCacheControl } from "~/lib/utils";
import { getTopLeaderboard } from "~/services/prisma/tracks.server";
import type { Route } from "./+types/home";

export function headers(_: Route.HeadersArgs) {
  return {
    "Cache-Control": getCacheControl({ browser: "half-hour", cdn: "hour" }),
  };
}

export function loader(_: Route.LoaderArgs) {
  return { leaderboard: getTopLeaderboard() };
}

export default function Home({
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
