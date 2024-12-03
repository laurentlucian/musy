import {
  getTracksByKeyword,
  getUsersByKeyword,
} from "~/services/prisma/search.server";
import { prisma } from "../../db.server";
import { SpotifyService } from "../spotify.server";

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
      include: {
        liked: { orderBy: { createdAt: "asc" }, select: { user: true } },
        recent: { orderBy: { playedAt: "desc" }, select: { user: true } },
      },
      where: {
        id: { in: [...existingTracks, ...prismaTracks].map((t) => t.id) },
      },
    })
  ).sort((a, b) => trackIds.indexOf(a.id) - trackIds.indexOf(b.id));
}

export async function getUserSpotifyRecent(userId: string) {
  const spotify = await SpotifyService.createFromUserId(userId);
  const client = spotify.getClient();
  const recent = await client
    .getMyRecentlyPlayedTracks({ limit: 50 })
    .then((data) => data.body.items)
    .catch(() => []);

  return transformTracks(recent.map((track: any) => track.track));
}

export async function getUserSpotifyLiked(userId: string) {
  const spotify = await SpotifyService.createFromUserId(userId);
  const client = spotify.getClient();
  const liked = await client
    .getMySavedTracks({ limit: 50 })
    .then((data) => data.body.items)
    .catch(() => []);

  return transformTracks(liked.map((track) => track.track));
}

export async function getUserSpotifyPlayback(userId: string) {
  const spotify = await SpotifyService.createFromUserId(userId);
  const client = spotify.getClient();
  const playback = await client
    .getMyCurrentPlayingTrack()
    .then((data) => data.body);

  return playback;
}

export async function getSpotifyTracks(keyword: string, userId: string) {
  const spotify = await SpotifyService.createFromUserId(userId);
  const client = spotify.getClient();

  return client.searchTracks(keyword).then((res) => {
    if (res.statusCode !== 200) return [];
    if (!res.body.tracks) return [];
    return transformTracks(res.body.tracks.items);
  });
}

export async function getSearchResults({
  param,
  url,
  userId,
}: {
  param: string;
  url: URL;
  userId: string;
}) {
  const keyword = url.searchParams.get(param);
  if (!keyword) return { tracks: [], users: [] };
  const [tracks, users] = await Promise.all([
    getTracksByKeyword(keyword),
    getUsersByKeyword(keyword, userId),
  ]);

  return { spotify: getSpotifyTracks(keyword, userId), tracks, users };
}

export async function getSpotifyTrack(trackId: string, userId: string) {
  const spotify = await SpotifyService.createFromUserId(userId);
  const client = spotify.getClient();
  const track = await client.getTrack(trackId).then((res) => res.body);

  return track;
}

export async function getUserPlaylists(userId: string) {
  return prisma.playlist.findMany({
    orderBy: {
      tracks: {
        _count: "desc",
      },
    },
    take: 20,
    where: { userId },
  });
}
