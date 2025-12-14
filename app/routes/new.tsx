import { Suspense } from "react";
import { Feed } from "~/components/domain/feed";
import { Waver } from "~/components/icons/waver";
import { getFeed } from "~/lib/services/db/tracks.server";
import { db } from "~/lib/services/db.server";
import { getCacheControl } from "~/lib/utils";
import type { Route } from "./+types/new";

export function headers(_: Route.HeadersArgs) {
  return {
    "Cache-Control": getCacheControl({ browser: "half-hour", cdn: "hour" }),
  };
}

export async function loader(_: Route.LoaderArgs) {
  return { feed: getFeed(db) };
}

export default function New({ loaderData: { feed } }: Route.ComponentProps) {
  return (
    <ul className="flex w-full max-w-md flex-col gap-y-2">
      <Suspense fallback={<Waver />}>
        <Feed feed={feed} />
      </Suspense>
    </ul>
  );
}
