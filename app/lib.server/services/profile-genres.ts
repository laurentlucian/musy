import { and, desc, eq, inArray } from "drizzle-orm";
import { parseGenres } from "~/components/utils";
import { db } from "~/lib.server/db";
import { artist, topArtists } from "~/lib.server/db/schema";

export async function getProfileGenres(userId: string) {
  const snapshot = await db.query.topArtists.findFirst({
    where: and(
      eq(topArtists.userId, userId),
      eq(topArtists.type, "short_term"),
    ),
    orderBy: desc(topArtists.createdAt),
  });
  const artistIds = snapshot?.artistIds.split(",").filter(Boolean) ?? [];
  if (!artistIds.length) {
    return { genres: [], updatedAt: snapshot?.createdAt ?? null };
  }

  const artists = await db
    .select({ genres: artist.genres })
    .from(artist)
    .where(inArray(artist.id, artistIds));
  const counts = new Map<string, number>();
  for (const { genres } of artists) {
    for (const name of new Set(parseGenres(genres ?? "").filter(Boolean))) {
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
  }
  return {
    genres: Array.from(counts, ([name, count]) => ({ name, count })).sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name),
    ),
    updatedAt: snapshot?.createdAt ?? null,
  };
}
