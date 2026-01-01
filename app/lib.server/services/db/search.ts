import { and, eq, inArray, like, not } from "drizzle-orm";
import {
  likedTracks,
  profile,
  recentTracks,
  track,
  user,
} from "~/lib.server/db/schema";
import { db } from "~/lib.server/services/db";

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
  const trackIds = await db
    .select({ id: track.id })
    .from(track)
    .where(like(track.name, `%${keyword}%`));

  // Load tracks with relations (batch queries to respect SQLite param limit)
  // Using smaller batch size due to relation subqueries adding parameters
  const ids = trackIds.map(({ id }) => id);
  const queryBatchSize = 50; // SQLite limit is ~999 vars, relations add params
  const tracks: Awaited<ReturnType<typeof db.query.track.findMany>> = [];

  for (let i = 0; i < ids.length; i += queryBatchSize) {
    const batch = ids.slice(i, i + queryBatchSize);
    const batchTracks = await db.query.track.findMany({
      where: inArray(track.id, batch),
      with: {
        album: true,
        artists: {
          with: {
            artist: true,
          },
        },
      },
    });
    tracks.push(...batchTracks);
  }

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
          .from(likedTracks)
          .innerJoin(user, eq(likedTracks.userId, user.id))
          .innerJoin(profile, eq(user.id, profile.id))
          .where(eq(likedTracks.trackId, trackData.id))
          .orderBy(likedTracks.createdAt),
        db
          .select({
            user: {
              id: user.id,
              name: profile.name,
              email: profile.email,
            },
          })
          .from(recentTracks)
          .innerJoin(user, eq(recentTracks.userId, user.id))
          .innerJoin(profile, eq(user.id, profile.id))
          .where(eq(recentTracks.trackId, trackData.id))
          .orderBy(recentTracks.playedAt),
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
