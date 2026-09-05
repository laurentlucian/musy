import { count } from "drizzle-orm";
import { album, artist, track } from "~/lib.server/db/schema";
import { db } from "~/lib.server/services/db";
import type { Route } from "./+types/counts";

export async function loader(_: Route.LoaderArgs) {
  const [tracksCount] = await db.select({ count: count() }).from(track);
  const [artistsCount] = await db.select({ count: count() }).from(artist);
  const [albumsCount] = await db.select({ count: count() }).from(album);

  return {
    tracks: tracksCount.count,
    artists: artistsCount.count,
    albums: albumsCount.count,
  };
}

export default function Counts({
  loaderData: { tracks, artists, albums },
}: Route.ComponentProps) {
  return (
    <article>
      <h2 className="mb-8 font-semibold text-3xl">The catalog</h2>
      <dl className="divide-y divide-border border-y border-border">
        {[
          ["Tracks", tracks],
          ["Artists", artists],
          ["Albums", albums],
        ].map(([label, total]) => (
          <div
            key={label}
            className="flex items-baseline justify-between gap-6 py-7"
          >
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-semibold text-2xl tabular-nums">
              {total.toLocaleString()}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
