import { count, eq, or } from "drizzle-orm";
import { album, artist, track } from "~/lib.server/db/schema";
import { db } from "~/lib.server/services/db";
import type { Route } from "./+types/counts";

export async function loader(_: Route.LoaderArgs) {
  const [tracksCount] = await db
    .select({ count: count() })
    .from(track);
  const [artistsCount] = await db
    .select({ count: count() })
    .from(artist);
  const [albumsCount] = await db
    .select({ count: count() })
    .from(album);
  const [artistsNotEnrichedCount] = await db
    .select({ count: count() })
    .from(artist)
    .where(eq(artist.enriched, false));
  const [albumsNotEnrichedCount] = await db
    .select({ count: count() })
    .from(album)
    .where(eq(album.enriched, false));

  return {
    tracks: tracksCount.count,
    artists: artistsCount.count,
    albums: albumsCount.count,
    artistsNotEnriched: artistsNotEnrichedCount.count,
    albumsNotEnriched: albumsNotEnrichedCount.count,
  };
}

export default function Counts({
  loaderData: {
    tracks,
    artists,
    albums,
    artistsNotEnriched,
    albumsNotEnriched,
  },
}: Route.ComponentProps) {
  return (
    <article className="flex flex-col gap-6 sm:flex-1">
      <div className="flex flex-col gap-4">
        <div className="bg-card rounded-lg p-6">
          <p className="text-muted-foreground text-sm">Tracks</p>
          <p className="text-3xl font-semibold">{tracks.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-lg p-6">
          <p className="text-muted-foreground text-sm">Artists</p>
          <p className="text-3xl font-semibold">{artists.toLocaleString()}</p>
          <p className="text-muted-foreground text-xs mt-1">
            {artistsNotEnriched.toLocaleString()} not enriched
          </p>
        </div>
        <div className="bg-card rounded-lg p-6">
          <p className="text-muted-foreground text-sm">Albums</p>
          <p className="text-3xl font-semibold">{albums.toLocaleString()}</p>
          <p className="text-muted-foreground text-xs mt-1">
            {albumsNotEnriched.toLocaleString()} not enriched
          </p>
        </div>
      </div>
    </article>
  );
}
