import { eq } from "drizzle-orm";
import { artist } from "~/lib/db/schema";
import type { Database } from "~/lib/services/db.server";

export async function getArtist(db: Database, artistId: string) {
  const artistResult = await db.query.artist.findFirst({
    where: eq(artist.id, artistId),
    with: {
      albums: true,
    },
  });

  return artistResult;
}
