import type { Track } from '@prisma/client';

import { prisma } from '../db.server';
import { redis } from '../scheduler/redis.server';
import { getUserSpotify } from '../spotify.server';

export const createTrackModel = (track: SpotifyApi.TrackObjectFull) => ({
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
});

const transformTracks = async (tracks: SpotifyApi.TrackObjectFull[]) => {
  const trackIds = tracks.map((track) => track.id);
  const existingTracks = await prisma.track.findMany({
    select: { id: true },
    where: { id: { in: trackIds } },
  });

  const newTracks = tracks.filter((track) => !existingTracks.find((t) => t.id === track.id));
  const prismaTracks = await Promise.all(
    newTracks
      .filter((t) => t.name !== '') // tracks removed by spotify have empty names
      .map((track) => prisma.track.create({ data: createTrackModel(track) })),
  );

  return (
    await prisma.track.findMany({
      include: {
        liked: { orderBy: { createdAt: 'asc' }, select: { user: true } },
        recent: { select: { user: true } },
      },
      where: {
        id: { in: [...existingTracks, ...prismaTracks].map((t) => t.id) },
      },
    })
  ).sort((a, b) => trackIds.indexOf(a.id) - trackIds.indexOf(b.id));
};

export const getUserSpotifyRecent = async (userId: string) => {
  const { spotify } = await getUserSpotify(userId);
  const recent = await spotify
    .getMyRecentlyPlayedTracks({ limit: 50 })
    .then((data) => data.body.items)
    .catch(() => []);

  return transformTracks(recent.map((track) => track.track));
};

export const getUserSpotifyLiked = async (userId: string) => {
  const { spotify } = await getUserSpotify(userId);
  const liked = await spotify
    .getMySavedTracks({ limit: 50 })
    .then((data) => data.body.items)
    .catch(() => []);

  return transformTracks(liked.map((track) => track.track));
};

export const getUserSpotifyTop = async (userId: string, url: URL) => {
  const range = (url.searchParams.get('top-filter') || 'medium_term') as
    | 'medium_term'
    | 'long_term'
    | 'short_term';

  const { spotify } = await getUserSpotify(userId);
  const top = await spotify
    .getMyTopTracks({ limit: 50, time_range: range })
    .then((data) => data.body.items)
    .catch(() => []);

  return transformTracks(top.map((track) => track));
};

export const getCachedUserTop = async (userId: string, url: URL) => {
  const topFilter = (url.searchParams.get('top-filter') || 'medium_term') as
    | 'medium_term'
    | 'long_term'
    | 'short_term';

  const cacheKeyTop = 'profile_top_prisma' + topFilter + '_' + userId;
  const cachedDataTop = await redis.get(cacheKeyTop);
  let top = [] as Track[];

  if (cachedDataTop) {
    top = JSON.parse(cachedDataTop) as Track[];
  } else {
    top = await getUserSpotifyTop(userId, url);
    await redis.set(cacheKeyTop, JSON.stringify(top), 'EX', 60 * 60 * 24);
  }
  return top;
};

export const getUserSpotifyPlayback = async (userId: string) => {
  const { spotify } = await getUserSpotify(userId);
  const playback = await spotify.getMyCurrentPlayingTrack().then((data) => data.body);

  return playback;
};

export const getSpotifyTracks = async (keyword: string, userId: string) => {
  const { spotify } = await getUserSpotify(userId);

  return spotify.searchTracks(keyword).then((res) => {
    if (res.statusCode !== 200) return [];
    if (!res.body.tracks) return [];
    return transformTracks(res.body.tracks.items);
  });
};

export const getUsers = async (keyword: string) => {
  return prisma.profile.findMany({
    include: {
      playback: { include: { track: true } },
      settings: true,
    },
    where: { name: { contains: keyword } },
  });
};

export const getSearchResults = async ({
  param,
  url,
  userId,
}: {
  param: string;
  url: URL;
  userId: string;
}) => {
  const keyword = url.searchParams.get(param);
  if (!keyword) return { tracks: [], users: [] };
  const [tracks, users] = await Promise.all([getSpotifyTracks(keyword, userId), getUsers(keyword)]);

  return { tracks, users };
};

export const getSpotifyTrack = async (trackId: string, userId: string) => {
  const { spotify } = await getUserSpotify(userId);
  const track = await spotify.getTrack(trackId).then((res) => res.body);

  return track;
};
