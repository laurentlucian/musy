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
    <article className="flex flex-col gap-6 sm:flex-1">
      <div className="flex flex-col gap-4">
        <div className="rounded-lg bg-card p-6">
          <p className="text-muted-foreground text-sm">Tracks</p>
          <p className="font-semibold text-3xl">{tracks.toLocaleString()}</p>
        </div>
        <div className="rounded-lg bg-card p-6">
          <p className="text-muted-foreground text-sm">Artists</p>
          <p className="font-semibold text-3xl">{artists.toLocaleString()}</p>
        </div>
        <div className="rounded-lg bg-card p-6">
          <p className="text-muted-foreground text-sm">Albums</p>
          <p className="font-semibold text-3xl">{albums.toLocaleString()}</p>
        </div>
      </div>
    </article>
  );
}
