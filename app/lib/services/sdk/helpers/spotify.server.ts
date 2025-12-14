import { inArray } from "drizzle-orm";
import type { Artist, Track } from "spotified";
import { boolean, nullable, number, object, parse, string } from "valibot";
import { artist, track } from "~/lib/db/schema";
import { db } from "~/lib/services/db.server";
import { getSpotifyClient } from "~/lib/services/sdk/spotify.server";

const trackSchema = object({
  id: string(),
  uri: string(),
  name: string(),
  albumName: string(),
  albumUri: string(),
  artist: string(),
  artistUri: string(),
  duration: number(),
  explicit: boolean(),
  image: string(),
  link: string(),
  preview_url: nullable(string()),
});

export function createTrackModel(track: Track) {
  const trackData = {
    albumName: track.album?.name,
    albumUri: track.album?.uri,
    artist: track.artists?.[0]?.name,
    artistUri: track.artists?.[0]?.uri,
    duration: track.duration_ms ?? 0,
    explicit: track.explicit ?? false,
    id: track.id,
    image: track.album?.images?.[0]?.url,
    link: track.external_urls?.spotify,
    name: track.name,
    preview_url: track.preview_url,
    uri: track.uri,
  };

  return parse(trackSchema, trackData);
}

export async function transformTracks(tracks: Track[]) {
  const trackIds = tracks.map((t) => t.id).filter((id) => id !== undefined);
  const existing = await db
    .select({ id: track.id })
    .from(track)
    .where(inArray(track.id, trackIds));

  const existingIds = new Set(existing.map((e) => e.id));
  const newTracks = tracks.filter((t) => !existingIds.has(t.id));

  if (newTracks.length > 0) {
    const tracksToInsert = newTracks.map(createTrackModel).map((t) => ({
      ...t,
      explicit: t.explicit ? "1" : "0",
    }));
    await db.insert(track).values(tracksToInsert);
  }

  return trackIds;
}

export async function getTrackFromSpotify(keyword: string, userId: string) {
  const spotify = await getSpotifyClient({ userId });

  const result = await spotify.search.searchForItem(keyword, ["track"]);

  const first = result.tracks?.items[0];

  if (!first) return null;
  const tracks = await transformTracks([first]);

  return tracks[0];
}

const artistSchema = object({
  id: string(),
  followers: number(),
  uri: string(),
  popularity: number(),
  genres: string(),
  name: string(),
  image: string(),
});

export function createArtistModel(artist: Artist) {
  const data = {
    id: artist.id,
    followers: artist.followers?.total,
    uri: artist.uri,
    popularity: artist.popularity,
    genres: JSON.stringify(artist.genres ?? []),
    name: artist.name,
    image: artist.images?.[0]?.url,
  };

  return parse(artistSchema, data);
}

export async function transformArtists(artists: Artist[]) {
  const artistIds = artists.map((a) => a.id).filter((id) => id !== undefined);
  const existing = await db
    .select({ id: artist.id })
    .from(artist)
    .where(inArray(artist.id, artistIds));

  const existingIds = new Set(existing.map((e) => e.id));
  const newArtists = artists.filter((a) => !existingIds.has(a.id));

  if (newArtists.length > 0) {
    await db.insert(artist).values(newArtists.map(createArtistModel));
  }

  return artistIds;
}
