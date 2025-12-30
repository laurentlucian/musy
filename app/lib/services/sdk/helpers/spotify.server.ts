import type { Artist, Track } from "spotified";
import { artist, track } from "~/lib/db/schema";
import { db } from "~/lib/services/db.server";
import { notNull } from "~/lib/utils";

type SpotifyTrack = Track;

export function createTrackModel(spotifyTrack: SpotifyTrack) {
  if (!spotifyTrack.id || !spotifyTrack.uri || !spotifyTrack.name) {
    throw new Error("Track must have id, uri, and name");
  }

  const album = "album" in spotifyTrack ? spotifyTrack.album : null;
  const artists = spotifyTrack.artists || [];
  const firstArtist = artists[0];

  if (!firstArtist || !firstArtist.name) {
    throw new Error("Track must have at least one artist with a name");
  }

  const image =
    album?.images?.[0]?.url || spotifyTrack.album?.images?.[0]?.url || "";

  return {
    id: spotifyTrack.id,
    uri: spotifyTrack.uri,
    name: spotifyTrack.name,
    image,
    albumUri: album?.uri || "",
    albumName: album?.name || "",
    artist: firstArtist.name,
    artistUri: firstArtist.uri || firstArtist.id || "",
    explicit: spotifyTrack.explicit || false,
    previewUrl: spotifyTrack.preview_url || null,
    link: spotifyTrack.external_urls?.spotify || "",
    duration: spotifyTrack.duration_ms || 0,
    provider: "spotify" as const,
  };
}

export async function transformTracks(
  tracks: SpotifyTrack[],
): Promise<string[]> {
  const trackModels = tracks
    .map((track) => {
      try {
        return createTrackModel(track);
      } catch {
        return null;
      }
    })
    .filter(notNull);

  if (trackModels.length === 0) return [];

  // Upsert tracks (D1 has 100 param limit, 13 columns = max 7 tracks per batch)
  const tracksToInsert = trackModels.map((t) => ({
    ...t,
    explicit: t.explicit ? "1" : "0",
  }));
  const batchSize = 7;
  for (let i = 0; i < tracksToInsert.length; i += batchSize) {
    const batch = tracksToInsert.slice(i, i + batchSize);
    await db.insert(track).values(batch).onConflictDoNothing();
  }

  return trackModels.map((t) => t.id);
}

export async function transformArtists(artists: Artist[]): Promise<string[]> {
  if (artists.length === 0) return [];

  const artistModels = artists
    .filter((a) => a.id && a.uri && a.name)
    .map((a) => ({
      id: a.id!,
      uri: a.uri!,
      name: a.name!,
      image: a.images?.[0]?.url || "",
      popularity: a.popularity || 0,
      followers: a.followers?.total || 0,
      genres: a.genres?.join(",") || "",
    }));

  if (artistModels.length === 0) return [];

  // Upsert artists (D1 has 100 param limit, 7 columns = max 14 artists per batch)
  const batchSize = 14;
  for (let i = 0; i < artistModels.length; i += batchSize) {
    const batch = artistModels.slice(i, i + batchSize);
    await db.insert(artist).values(batch).onConflictDoNothing();
  }

  return artistModels.map((a) => a.id);
}
