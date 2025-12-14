import { and, desc, eq, like } from "drizzle-orm";
import {
  artist,
  artistToTopArtists,
  generated,
  generatedPlaylist,
  likedSongs,
  recentSongs,
  topArtists,
  topSongs,
  topSongsToTrack,
  track,
} from "~/lib/db/schema";
import { db } from "~/lib/services/db.server";
import { askAITaste } from "~/lib/services/sdk/helpers/ai/taste.server";
import { askAITracks } from "~/lib/services/sdk/helpers/ai/track.server";
import { getTrackFromSpotify } from "~/lib/services/sdk/helpers/spotify.server";
import { generateId } from "~/lib/utils.server";

async function _getTasteFromUser(userId: string) {
  const existing = await db.query.generated.findFirst({
    where: eq(generated.userId, userId),
  });

  if (existing?.taste) {
    return existing.taste;
  }

  const [recents, liked] = await Promise.all([
    db
      .select({
        track: track,
      })
      .from(recentSongs)
      .innerJoin(track, eq(recentSongs.trackId, track.id))
      .where(eq(recentSongs.userId, userId))
      .orderBy(desc(recentSongs.playedAt))
      .limit(20),
    db
      .select({
        track: track,
      })
      .from(likedSongs)
      .innerJoin(track, eq(likedSongs.trackId, track.id))
      .where(eq(likedSongs.userId, userId))
      .orderBy(desc(likedSongs.createdAt))
      .limit(20),
  ]);

  const tracks = [...recents, ...liked].map((item) => ({
    name: item.track.name,
    artist: item.track.artist,
  }));

  const prompt = `Based on these 20 songs, create a concise taste profile that captures the user's musical preferences. Focus on genres, moods, and sonic characteristics. Make it consumable by an LLM. Keep it natural and descriptive:
    ${JSON.stringify(tracks.join("\n"))}`;

  const taste = await askAITaste(prompt);
  console.info("taste", taste);

  const now = new Date().toISOString();
  await db
    .insert(generated)
    .values({
      userId,
      taste,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [generated.userId],
      set: { taste, updatedAt: now },
    });

  return taste;
}

export async function generatePlaylist(
  args: {
    mood: string;
    year: string;
    familiar: boolean | null;
    popular: boolean | null;
  },
  userId: string,
) {
  const [songsRecord, artistsRecord] = await Promise.all([
    db.query.topSongs.findFirst({
      where: and(eq(topSongs.userId, userId), eq(topSongs.type, "long_term")),
      orderBy: desc(topSongs.createdAt),
    }),
    db.query.topArtists.findFirst({
      where: and(
        eq(topArtists.userId, userId),
        eq(topArtists.type, "long_term"),
      ),
      orderBy: desc(topArtists.createdAt),
    }),
  ]);

  // Get tracks for top songs
  const songs = songsRecord
    ? await db
        .select({ track })
        .from(topSongsToTrack)
        .innerJoin(track, eq(topSongsToTrack.b, track.id))
        .where(eq(topSongsToTrack.a, songsRecord.id))
    : [];

  // Get artists for top artists
  const artists = artistsRecord
    ? await db
        .select({ artist })
        .from(artistToTopArtists)
        .innerJoin(artist, eq(artistToTopArtists.a, artist.id))
        .where(eq(artistToTopArtists.b, artistsRecord.id))
    : [];

  const { mood, year, familiar, popular } = args;
  const result = await askAITracks({
    mood,
    year,
    familiar,
    popular,
    top: {
      songs: songs.map((item) => ({
        name: item.track.name,
        artist: item.track.artist,
      })),
      artists: artists.map((item) => ({
        name: item.artist.name,
      })),
    },
  });

  const promises = result.map(async (trackData) => {
    const exists = await db.query.track.findFirst({
      where: and(
        like(track.name, `%${trackData.name}%`),
        like(track.artist, `%${trackData.artist}%`),
      ),
    });

    if (exists) {
      return exists;
    }

    const created = await getTrackFromSpotify(
      `${trackData.name} ${trackData.artist}`,
      userId,
    );

    if (!created) return null;

    return await db.query.track.findFirst({
      where: eq(track.id, created),
    });
  });

  const tracks = (await Promise.all(promises)).filter(
    (track) => track !== null,
  );

  const existing = await db.query.generatedPlaylist.findFirst({
    where: and(
      eq(generatedPlaylist.mood, mood),
      eq(generatedPlaylist.year, parseInt(year, 10)),
      eq(generatedPlaylist.familiar, familiar),
      eq(generatedPlaylist.popular, popular),
      eq(generatedPlaylist.ownerId, userId),
    ),
  });

  if (existing) {
    // Update existing playlist - first delete existing relations, then add new ones
    await db.delete(topSongsToTrack).where(eq(topSongsToTrack.a, existing.id));

    if (tracks.length > 0) {
      await db.insert(topSongsToTrack).values(
        tracks.map((track) => ({
          a: existing.id,
          b: track!.id,
        })),
      );
    }

    await db
      .update(generatedPlaylist)
      .set({ updatedAt: new Date().toISOString() })
      .where(eq(generatedPlaylist.id, existing.id));

    return existing.id;
  }

  let ai = await db.query.generated.findFirst({
    where: eq(generated.userId, userId),
  });

  if (!ai) {
    const now = new Date().toISOString();
    const [newAi] = await db
      .insert(generated)
      .values({
        userId,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    ai = newAi;
  }

  const playlistId = generateId();
  const now = new Date().toISOString();

  await db.transaction(async (tx) => {
    // Create the playlist
    await tx.insert(generatedPlaylist).values({
      id: playlistId,
      mood,
      year: parseInt(year, 10),
      familiar,
      popular,
      ownerId: ai!.id,
      createdAt: now,
      updatedAt: now,
    });

    // Add track relations
    if (tracks.length > 0) {
      await tx.insert(topSongsToTrack).values(
        tracks.map((track) => ({
          a: playlistId,
          b: track!.id,
        })),
      );
    }
  });

  return playlistId;
}
