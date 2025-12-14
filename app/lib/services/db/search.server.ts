import { and, eq, like, not } from "drizzle-orm";
import { likedSongs, profile, recentSongs, track, user } from "~/lib/db/schema";
import { db } from "~/lib/services/db.server";

export async function getUsersByKeyword(keyword: string, userId: string) {
  return db
    .select()
    .from(profile)
    .where(
      and(not(eq(profile.id, userId)), like(profile.name, `%${keyword}%`)),
    );
}

export async function getTracksByKeyword(keyword: string) {
  // Get tracks that match the keyword
  const tracks = await db
    .select()
    .from(track)
    .where(like(track.name, `%${keyword}%`));

  // For each track, get liked and recent data
  const tracksWithRelations = await Promise.all(
    tracks.map(async (trackData) => {
      const [liked, recent] = await Promise.all([
        db
          .select({
            user: {
              id: user.id,
              name: profile.name,
              email: profile.email,
            },
          })
          .from(likedSongs)
          .innerJoin(user, eq(likedSongs.userId, user.id))
          .innerJoin(profile, eq(user.id, profile.id))
          .where(eq(likedSongs.trackId, trackData.id))
          .orderBy(likedSongs.createdAt),
        db
          .select({
            user: {
              id: user.id,
              name: profile.name,
              email: profile.email,
            },
          })
          .from(recentSongs)
          .innerJoin(user, eq(recentSongs.userId, user.id))
          .innerJoin(profile, eq(user.id, profile.id))
          .where(eq(recentSongs.trackId, trackData.id))
          .orderBy(recentSongs.playedAt),
      ]);

      return {
        ...trackData,
        liked,
        recent,
        _count: {
          recent: recent.length,
        },
      };
    }),
  );

  // Sort by recent count descending
  return tracksWithRelations.sort((a, b) => b._count.recent - a._count.recent);
}
