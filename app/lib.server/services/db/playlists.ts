import { and, eq } from "drizzle-orm";
import {
  likedTracks,
  playlist,
  playlistTrack,
  track,
} from "~/lib.server/db/schema";
import type { Database } from "~/lib.server/services/db";

export async function getLikedTracksByYear(
  db: Database,
  userId: string,
  provider: string,
) {
  const allLiked = await db
    .select({
      trackId: likedTracks.trackId,
      createdAt: likedTracks.createdAt,
      uri: track.uri,
    })
    .from(likedTracks)
    .innerJoin(track, eq(track.id, likedTracks.trackId))
    .where(and(eq(likedTracks.userId, userId), eq(track.provider, provider)));

  const tracksByYear = new Map<
    number,
    Array<{ trackId: string; uri: string; createdAt: string }>
  >();

  for (const item of allLiked) {
    const date = new Date(item.createdAt);
    const year = date.getFullYear();

    if (!tracksByYear.has(year)) {
      tracksByYear.set(year, []);
    }

    tracksByYear.get(year)!.push({
      trackId: item.trackId,
      uri: item.uri,
      createdAt: item.createdAt,
    });
  }

  return tracksByYear;
}

export async function findExistingPlaylistByName(
  db: Database,
  userId: string,
  name: string,
) {
  const existing = await db.query.playlist.findFirst({
    where: and(eq(playlist.userId, userId), eq(playlist.name, name)),
  });

  return existing;
}

export async function getPlaylistTracksFromDB(
  db: Database,
  playlistId: string,
) {
  const tracks = await db
    .select({
      trackId: playlistTrack.trackId,
      addedAt: playlistTrack.addedAt,
    })
    .from(playlistTrack)
    .where(eq(playlistTrack.playlistId, playlistId));

  return tracks;
}
