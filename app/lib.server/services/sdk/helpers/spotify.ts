import { and, eq } from "drizzle-orm";
import { notNull } from "~/components/utils";
import { album, artist, track, trackToArtist } from "~/lib.server/db/schema";
import type { Artist, SimplifiedAlbum, Track } from "~/lib.server/sdk/spotify";
import { type Spotified } from "~/lib.server/services/sdk/spotify";
import { db } from "~/lib.server/services/db";

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
    explicit: spotifyTrack.explicit || false,
    previewUrl: spotifyTrack.preview_url || null,
    link: spotifyTrack.external_urls?.spotify || "",
    duration: spotifyTrack.duration_ms || 0,
    provider: "spotify" as const,
  };
}

export async function transformTracks(
  tracks: SpotifyTrack[],
  spotify?: Spotified,
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

  // Collect all artists and albums from these tracks that might need enrichment
  const artistsToEnrich = new Map<string, Artist>();
  const albumsToEnrich = new Map<string, SimplifiedAlbum>();

  for (const spotifyTrack of tracks) {
    for (const a of spotifyTrack.artists || []) {
      if (a.id) {
        // If it already has genres or popularity, it's a full artist object
        if ("genres" in a && a.genres && "popularity" in a) {
          artistsToEnrich.set(a.id, a as Artist);
        } else if (!artistsToEnrich.has(a.id)) {
          artistsToEnrich.set(a.id, a as Artist);
        }
      }
    }
    if ("album" in spotifyTrack && spotifyTrack.album?.id) {
      if (!albumsToEnrich.has(spotifyTrack.album.id)) {
        albumsToEnrich.set(spotifyTrack.album.id, spotifyTrack.album);
      }
    }
  }

  // Enrichment step if spotify client is provided
  if (spotify) {
    // 1. Fetch full artists for those that are simplified
    const simplifiedArtistIds = Array.from(artistsToEnrich.entries())
      .filter(([_, a]) => !a.genres || !a.popularity)
      .map(([id]) => id);

    if (simplifiedArtistIds.length > 0) {
      for (let i = 0; i < simplifiedArtistIds.length; i += 50) {
        const batchIds = simplifiedArtistIds.slice(i, i + 50);
        const { artists: fullArtists } = await spotify.artist.getArtists(
          batchIds,
        );
        for (const fa of fullArtists) {
          if (fa?.id) artistsToEnrich.set(fa.id, fa);
        }
      }
    }

    // 2. Fetch full albums (Simplified album often lacks popularity/etc but we mostly need images and info we already have)
    // However, the user wants "all columns queried and filled".
    const simplifiedAlbumIds = Array.from(albumsToEnrich.keys());
    if (simplifiedAlbumIds.length > 0) {
      for (let i = 0; i < simplifiedAlbumIds.length; i += 20) {
        const batchIds = simplifiedAlbumIds.slice(i, i + 20);
        const { albums: fullAlbums } = await spotify.album.getAlbums(batchIds);
        for (const fa of fullAlbums) {
          if (fa?.id) albumsToEnrich.set(fa.id, fa);
        }
      }
    }
  }

  // Create relations and insert enriched records
  for (const trackModel of trackModels) {
    const spotifyTrack = tracks.find((t) => t.id === trackModel.id);
    if (!spotifyTrack) continue;

    const albumData = "album" in spotifyTrack ? spotifyTrack.album : null;
    const artists = spotifyTrack.artists || [];

    // Create artists and track-artist relations
    if (artists.length > 0) {
      const artistIds = await transformArtists(
        artists.map((a) => artistsToEnrich.get(a.id!) || a),
        spotify,
      );
      for (const artistId of artistIds) {
        const existingRelation = await db.query.trackToArtist.findFirst({
          where: and(
            eq(trackToArtist.trackId, trackModel.id),
            eq(trackToArtist.artistId, artistId),
          ),
        });
        if (!existingRelation) {
          await db.insert(trackToArtist).values({
            trackId: trackModel.id,
            artistId,
          });
        }
      }
    }

    // Create album and set track.albumId
    if (albumData?.id && albumData?.uri && albumData?.name) {
      const fullAlbumData = albumsToEnrich.get(albumData.id) || albumData;
      const albumArtist = fullAlbumData.artists?.[0];
      if (albumArtist?.id) {
        // Ensure album artist exists too
        await transformArtists([albumArtist], spotify);

        const existingAlbum = await db.query.album.findFirst({
          where: eq(album.id, fullAlbumData.id),
        });

        if (!existingAlbum) {
          await db
            .insert(album)
            .values({
              id: fullAlbumData.id,
              uri: fullAlbumData.uri,
              type: fullAlbumData.album_type || "album",
              total: String(fullAlbumData.total_tracks || 0),
              image: fullAlbumData.images?.[0]?.url || "",
              name: fullAlbumData.name,
              date: fullAlbumData.release_date || "",
              popularity: (fullAlbumData as any).popularity || 0,
              artistId: albumArtist.id,
            })
            .onConflictDoNothing();
        }

        await db
          .update(track)
          .set({ albumId: fullAlbumData.id })
          .where(eq(track.id, trackModel.id));
      }
    }
  }

  return trackModels.map((t) => t.id);
}

export async function transformArtists(
  artists: Artist[],
  spotify?: Spotified,
): Promise<string[]> {
  if (artists.length === 0) return [];

  // Harvest missing IDs for enrichment if spotify client is provided
  const artistMap = new Map<string, Artist>(
    artists.filter((a) => a.id).map((a) => [a.id!, a]),
  );
  if (spotify) {
    const simplifiedIds = artists
      .filter((a) => a.id && (!a.genres || !a.popularity))
      .map((a) => a.id!);
    if (simplifiedIds.length > 0) {
      for (let i = 0; i < simplifiedIds.length; i += 50) {
        const batchIds = simplifiedIds.slice(i, i + 50);
        const { artists: fullArtists } = await spotify.artist.getArtists(
          batchIds,
        );
        for (const fa of fullArtists) {
          if (fa?.id) artistMap.set(fa.id, fa);
        }
      }
    }
  }

  const artistModels = Array.from(artistMap.values())
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
