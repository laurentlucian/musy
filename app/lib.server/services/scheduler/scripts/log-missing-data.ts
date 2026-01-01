import { count, eq } from "drizzle-orm";
import { log } from "~/components/utils";
import { album, artist } from "~/lib.server/db/schema";
import { db } from "~/lib.server/services/db";

export async function logMissingData() {
  log("checking albums and artists for missing data", "missing-data");

  const [
    albumsWithEmptyImage,
    albumsWithZeroPopularity,
    artistsWithEmptyImage,
    artistsWithZeroPopularity,
    artistsWithoutGenre,
  ] = await Promise.all([
    db.select({ count: count() }).from(album).where(eq(album.image, "")),
    db.select({ count: count() }).from(album).where(eq(album.popularity, 0)),
    db.select({ count: count() }).from(artist).where(eq(artist.image, "")),
    db.select({ count: count() }).from(artist).where(eq(artist.popularity, 0)),
    db.select({ count: count() }).from(artist).where(eq(artist.genres, "")),
  ]);

  log(
    `albums with empty image: ${albumsWithEmptyImage[0]?.count ?? 0}`,
    "missing-data",
  );
  log(
    `albums with popularity 0: ${albumsWithZeroPopularity[0]?.count ?? 0}`,
    "missing-data",
  );
  log(
    `artists with empty image: ${artistsWithEmptyImage[0]?.count ?? 0}`,
    "missing-data",
  );
  log(
    `artists with popularity 0: ${artistsWithZeroPopularity[0]?.count ?? 0}`,
    "missing-data",
  );
  log(
    `artists without genre: ${artistsWithoutGenre[0]?.count ?? 0}`,
    "missing-data",
  );

  log("completed missing data check", "missing-data");
}
