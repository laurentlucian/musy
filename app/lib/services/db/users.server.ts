import { endOfYear, setYear, startOfYear } from "date-fns";
import { and, count, desc, eq, gte, inArray, lte } from "drizzle-orm";
import {
  album,
  artist,
  likedTracks,
  playback,
  playbackHistory,
  playlist,
  playlistTrack,
  profile,
  provider,
  recentTracks,
  top,
  topArtists,
  topTracks,
  track,
  trackToArtist,
  user,
} from "~/lib/db/schema";
import { db } from "~/lib/services/db.server";

export async function getProvider(args: {
  userId: string;
  type: "spotify" | "google";
}) {
  const data = await db.query.provider.findFirst({
    where: and(eq(provider.userId, args.userId), eq(provider.type, args.type)),
  });
  return data;
}

export type Providers = ReturnType<typeof getProviders>;
export async function getProviders(userId: string) {
  return db
    .select({ type: provider.type })
    .from(provider)
    .where(eq(provider.userId, userId));
}

export async function updateToken(args: {
  id: string;
  token: string;
  expiresAt: number;
  refreshToken?: string;
  type: "spotify" | "google";
}) {
  const { id, token, expiresAt, refreshToken, type } = args;
  await db
    .update(provider)
    .set({
      accessToken: token,
      expiresAt,
      refreshToken,
      revoked: "0",
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(provider.userId, id), eq(provider.type, type)));
  return expiresAt;
}

export async function getAllUsersId() {
  const users = await db
    .select({ id: user.id })
    .from(user)
    .innerJoin(provider, eq(user.id, provider.userId))
    .where(eq(provider.revoked, "0"));
  return users.map((u) => u.id);
}

export async function revokeUser(
  userId: string,
  providerType: "spotify" | "google",
) {
  await db
    .update(provider)
    .set({ revoked: "1", updatedAt: new Date().toISOString() })
    .where(and(eq(provider.userId, userId), eq(provider.type, providerType)));
}

export async function deleteUser(userId: string) {
  // Delete playlist tracks first (foreign key constraint)
  const userPlaylists = await db
    .select({ id: playlist.id })
    .from(playlist)
    .where(eq(playlist.userId, userId));
  const playlistIds = userPlaylists.map((p) => p.id);

  await Promise.all(
    [
      db.delete(provider).where(eq(provider.userId, userId)),
      db.delete(likedTracks).where(eq(likedTracks.userId, userId)),
      db.delete(recentTracks).where(eq(recentTracks.userId, userId)),
      db.delete(playback).where(eq(playback.userId, userId)),
      db.delete(playbackHistory).where(eq(playbackHistory.userId, userId)),
      playlistIds.length > 0 &&
        db
          .delete(playlistTrack)
          .where(inArray(playlistTrack.playlistId, playlistIds)),
      db.delete(topTracks).where(eq(topTracks.userId, userId)),
      db.delete(topArtists).where(eq(topArtists.userId, userId)),
    ].filter(Boolean),
  );

  await Promise.all([
    db.delete(top).where(eq(top.userId, userId)),
    db.delete(playlist).where(eq(playlist.userId, userId)),
  ]);

  await db.delete(profile).where(eq(profile.id, userId));
  await db.delete(user).where(eq(user.id, userId));
}

export async function getProfile(userId: string) {
  return db.query.profile.findFirst({
    where: eq(profile.id, userId),
  });
}

export async function getStats(userId: string, year: number) {
  const date = setYear(new Date(), year);

  const [{ count: liked }] = await db
    .select({ count: count() })
    .from(likedTracks)
    .where(
      and(
        eq(likedTracks.userId, userId),
        gte(likedTracks.createdAt, startOfYear(date).toISOString()),
        lte(likedTracks.createdAt, endOfYear(date).toISOString()),
      ),
    );

  let played = 0;
  let minutes = 0;
  const artists: Record<string, number> = {};
  const albums: Record<string, number> = {};
  const songs: Record<string, number> = {};

  const take = 2500;
  let skip = 0;
  let all = false;

  while (!all) {
    const rows = await db
      .select({
        track: {
          uri: track.uri,
          name: track.name,
          duration: track.duration,
        },
        artistName: artist.name,
        albumNameRel: album.name,
      })
      .from(recentTracks)
      .innerJoin(track, eq(recentTracks.trackId, track.id))
      .leftJoin(trackToArtist, eq(track.id, trackToArtist.trackId))
      .leftJoin(artist, eq(trackToArtist.artistId, artist.id))
      .leftJoin(album, eq(track.albumId, album.id))
      .where(
        and(
          eq(recentTracks.userId, userId),
          gte(recentTracks.playedAt, startOfYear(date).toISOString()),
          lte(recentTracks.playedAt, endOfYear(date).toISOString()),
        ),
      )
      .orderBy(desc(recentTracks.playedAt))
      .limit(take)
      .offset(skip);

    if (rows.length < take) {
      all = true;
    }

    skip += rows.length;
    const batch = calculateStats(rows);
    played += batch.played;
    minutes += batch.minutes;

    for (const [artist, count] of Object.entries(batch.artists)) {
      artists[artist] = (artists[artist] ?? 0) + count;
    }
    for (const [album, count] of Object.entries(batch.albums)) {
      albums[album] = (albums[album] ?? 0) + count;
    }
    for (const [song, count] of Object.entries(batch.songs)) {
      songs[song] = (songs[song] ?? 0) + count;
    }
  }

  const topItems = getTopItems({ songs, albums, artists });

  return {
    liked,
    played,
    minutes,
    artist: topItems.artist,
    album: topItems.album,
    song: topItems.song,
  };
}

function getTopItems(arg: {
  artists: Record<string, number>;
  albums: Record<string, number>;
  songs: Record<string, number>;
}) {
  const artist = Object.entries(arg.artists).reduce(
    (a, b) => (b[1] > a[1] ? b : a),
    ["", 0],
  )[0];

  const album = Object.entries(arg.albums).reduce(
    (a, b) => (b[1] > a[1] ? b : a),
    ["", 0],
  )[0];

  const song = Object.entries(arg.songs).reduce(
    (a, b) => (b[1] > a[1] ? b : a),
    ["", 0],
  )[0];

  return { artist, album, song };
}

function calculateStats(
  rows: {
    track: {
      name: string;
      duration: number;
    };
    artistName: string | null;
    albumNameRel: string | null;
  }[],
) {
  const minutes = rows.reduce(
    (acc, curr) => acc + curr.track.duration / 60_000,
    0,
  );

  const artists = rows.reduce(
    (acc, { artistName }) => {
      if (artistName) {
        acc[artistName] = (acc[artistName] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const albums = rows.reduce(
    (acc, { albumNameRel }) => {
      if (albumNameRel) {
        acc[albumNameRel] = (acc[albumNameRel] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const songs = rows.reduce(
    (acc, { track }) => {
      acc[track.name] = (acc[track.name] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return { minutes, artists, albums, songs, played: rows.length };
}
