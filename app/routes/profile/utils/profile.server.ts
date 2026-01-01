import { and, desc, eq, inArray } from "drizzle-orm";
import { use } from "react";
import { href, useNavigation, useSearchParams } from "react-router";
import { Artist } from "~/components/domain/artist";
import { NavLinkSub } from "~/components/domain/nav";
import { Track } from "~/components/domain/track";
import { Waver } from "~/components/icons/waver";
import { db } from "~/lib.server/db";
import {
  artist,
  top,
  topArtists,
  topTracks,
  track,
} from "~/lib.server/db/schema";

export async function getTopData({
  userId,
  range,
  type,
}: {
  userId: string;
  range: string;
  type: string;
}) {
  // Check if top record exists for user
  const topRecord = await db.query.top.findFirst({
    where: eq(top.userId, userId),
  });

  if (!topRecord) return null;

  if (type === "tracks") {
    // Get top tracks for this range
    const tracksRecord = await db.query.topTracks.findFirst({
      where: and(eq(topTracks.userId, userId), eq(topTracks.type, range)),
      orderBy: desc(topTracks.createdAt),
    });

    if (!tracksRecord) return null;

    // Get tracks based on trackIds with relations (batch queries to respect SQLite param limit)
    // Using smaller batch size due to relation subqueries adding parameters
    const trackIds = tracksRecord.trackIds.split(",");
    const queryBatchSize = 50; // SQLite limit is ~999 vars, relations add params
    const tracks: Awaited<ReturnType<typeof db.query.track.findMany>> = [];

    for (let i = 0; i < trackIds.length; i += queryBatchSize) {
      const batch = trackIds.slice(i, i + queryBatchSize);
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

    // Preserve order from trackIds
    const trackMap = new Map(tracks.map((t) => [t.id, t]));
    const orderedTracks = trackIds
      .map((id) => trackMap.get(id))
      .filter((t): t is NonNullable<(typeof tracks)[0]> => t !== undefined);

    return { tracks: orderedTracks };
  } else {
    // Get top artists for this range
    const artistsRecord = await db.query.topArtists.findFirst({
      where: and(eq(topArtists.userId, userId), eq(topArtists.type, range)),
      orderBy: desc(topArtists.createdAt),
    });

    if (!artistsRecord) return null;

    // Get artists based on artistIds
    const artistIds = artistsRecord.artistIds.split(",");
    const artists = await db
      .select()
      .from(artist)
      .where(inArray(artist.id, artistIds));

    // Sort artists according to their position in artistIds
    const artistMap = new Map(artists.map((a) => [a.id, a]));
    const sortedArtists = artistIds
      .map((id) => artistMap.get(id))
      .filter(Boolean) as typeof artists;

    return { artists: sortedArtists };
  }
}
