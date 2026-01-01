import { eq } from "drizzle-orm";
import { album } from "~/lib/db/schema";
import type { Database } from "~/lib/services/db.server";

export async function getAlbum(db: Database, albumId: string) {
  const albumResult = await db.query.album.findFirst({
    where: eq(album.id, albumId),
    with: {
      artist: true,
      tracks: {
        with: {
          artists: {
            with: {
              artist: true,
            },
          },
        },
      },
    },
  });

  return albumResult;
}
