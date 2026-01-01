import { eq } from "drizzle-orm";
import { artist } from "~/lib.server/db/schema";
import type { Database } from "~/lib.server/services/db";

export async function getArtist(db: Database, artistId: string) {
  const artistResult = await db.query.artist.findFirst({
    where: eq(artist.id, artistId),
    with: {
      albums: true,
    },
  });

  return artistResult;
}
