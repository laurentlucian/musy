import { prisma } from "@lib/services/db.server";
import { getSpotifyClient } from "@lib/services/sdk/spotify.server";
import type { Artist, Track } from "spotified";
import { boolean, nullable, number, object, parse, string } from "valibot";

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
  const existing = await prisma.track.findMany({
    where: { id: { in: trackIds } },
  });

  const newTracks = tracks.filter((t) => !existing.find((e) => e.id === t.id));

  await prisma.track.createMany({
    data: newTracks.map(createTrackModel),
  });

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
  const existing = await prisma.artist.findMany({
    where: { id: { in: artistIds } },
  });

  const newArtists = artists.filter(
    (a) => !existing.find((e) => e.id === a.id),
  );

  await prisma.artist.createMany({
    data: newArtists.map(createArtistModel),
  });

  return artistIds;
}
