import { prisma } from "@lib/services/db.server";
import {
  getTracksByKeyword,
  getUsersByKeyword,
} from "@lib/services/db/search.server";
import { getSpotifyClient } from "@lib/services/sdk/spotify.server";

export function createTrackModel(track: SpotifyApi.TrackObjectFull) {
  return {
    albumName: track.album.name,
    albumUri: track.album.uri,
    artist: track.artists[0].name,
    artistUri: track.artists[0].uri,
    duration: track.duration_ms,
    explicit: track.explicit,
    id: track.id,
    image: track.album.images[0].url,
    link: track.external_urls.spotify,
    name: track.name,
    preview_url: track.preview_url,
    uri: track.uri,
  };
}

export async function transformTracks(tracks: SpotifyApi.TrackObjectFull[]) {
  const trackIds = tracks.map((track) => track.id);
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

export async function getUserSpotifyRecent(userId: string) {
  const spotify = await getSpotifyClient({ userId });

  const recent = await spotify
    .getMyRecentlyPlayedTracks({ limit: 50 })
    .then((data) => data.body.items)
    .catch(() => []);

  return transformTracks(recent.map((track: any) => track.track));
}

export async function getUserSpotifyLiked(userId: string) {
  const spotify = await getSpotifyClient({ userId });

  const liked = await spotify
    .getMySavedTracks({ limit: 50 })
    .then((data) => data.body.items)
    .catch(() => []);

  return transformTracks(liked.map((track) => track.track));
}

export async function getUserSpotifyPlayback(userId: string) {
  const spotify = await getSpotifyClient({ userId });

  const playback = await spotify
    .getMyCurrentPlayingTrack()
    .then((data) => data.body);

  return playback;
}

export async function getTrackFromSpotify(keyword: string, userId: string) {
  const spotify = await getSpotifyClient({ userId });

  const result = await spotify.searchTracks(keyword);

  const first = result.body.tracks?.items[0];

  if (!first) return null;
  const tracks = await transformTracks([first]);

  return tracks[0];
}

export async function getSpotifyTrack(trackId: string, userId: string) {
  const spotify = await getSpotifyClient({ userId });

  const track = await spotify.getTrack(trackId).then((res) => res.body);

  return track;
}

export async function getUserPlaylists({
  userId,
  provider,
}: { userId: string; provider: string }) {
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
