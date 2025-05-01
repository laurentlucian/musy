import { prisma } from "@lib/services/db.server";
import { getSpotifyClient } from "@lib/services/sdk/spotify.server";
import type { Track } from "spotified";
import { boolean, number, object, optional, safeParse, string } from "valibot";

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
  preview_url: string(),
});

export function createTrackModel(track: Track) {
  const trackData = {
    albumName: track.album?.name ?? "",
    albumUri: track.album?.uri ?? "",
    artist: track.artists?.[0]?.name ?? "",
    artistUri: track.artists?.[0]?.uri ?? "",
    duration: track.duration_ms ?? 0,
    explicit: track.explicit ?? false,
    id: track.id ?? "",
    image: track.album?.images?.[0]?.url ?? "",
    link: track.external_urls?.spotify ?? "",
    name: track.name ?? "",
    preview_url: track.preview_url ?? "",
    uri: track.uri ?? "",
  };

  const result = safeParse(trackSchema, trackData);

  if (!result.success) {
    throw new Error(`invalid track data: ${result.issues[0].message}`);
  }

  return result.output;
}

export async function transformTracks(tracks: Track[]) {
  const trackIds = tracks
    .map((track) => track.id)
    .filter((id) => id !== undefined);
  const existingTracks = await prisma.track.findMany({
    select: { id: true },
    where: { id: { in: trackIds } },
  });

  const newTracks = tracks.filter(
    (track) => !existingTracks.find((t) => t.id === track.id),
  );
  const prismaTracks = await Promise.all(
    newTracks
      .filter((t) => t.name !== "") // tracks removed by spotify have empty names
      .map((track) => prisma.track.create({ data: createTrackModel(track) })),
  ).catch(() => []);

  return (
    await prisma.track.findMany({
      where: {
        id: { in: [...existingTracks, ...prismaTracks].map((t) => t.id) },
      },
    })
  ).sort((a, b) => trackIds.indexOf(a.id) - trackIds.indexOf(b.id));
}

export async function getTrackFromSpotify(keyword: string, userId: string) {
  const spotify = await getSpotifyClient({ userId });

  const result = await spotify.search.searchForItem(keyword, ["track"]);

  const first = result.tracks?.items[0];

  if (!first) return null;
  const tracks = await transformTracks([first]);

  return tracks[0];
}

export async function getUserPlaylists({
  userId,
  provider,
}: {
  userId: string;
  provider: string;
}) {
  const response = await prisma.playlist.findMany({
    orderBy: {
      tracks: {
        _count: "desc",
      },
    },
    where: { userId, provider },
  });

  return response;
}
