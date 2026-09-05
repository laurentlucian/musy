import { Database } from "bun:sqlite";
import { describe, expect, test } from "bun:test";
import { SQLiteSyncDialect } from "drizzle-orm/sqlite-core";
import {
  calculateListeningStats,
  listeningStatsQuery,
  type ListeningStatsRow,
} from "../app/lib.server/services/history-stats-query";

function fixture() {
  const db = new Database(":memory:");
  db.exec(`
    CREATE TABLE Track (id TEXT PRIMARY KEY, name TEXT, duration INTEGER, albumId TEXT);
    CREATE TABLE Album (id TEXT PRIMARY KEY, name TEXT);
    CREATE TABLE Artist (id TEXT PRIMARY KEY, name TEXT);
    CREATE TABLE _TrackToArtist (trackId TEXT, artistId TEXT);
    CREATE TABLE HistoryEvent (id TEXT PRIMARY KEY, albumName TEXT, artistName TEXT);
    CREATE TABLE RecentTracks (userId TEXT, trackId TEXT, playedAt TEXT, msPlayed INTEGER, historyEventId TEXT);
    INSERT INTO Track VALUES ('duet', 'Duet', 180000, 'album'), ('archive', 'Archived song', 999999, NULL);
    INSERT INTO Album VALUES ('album', 'Album');
    INSERT INTO Artist VALUES ('a', 'Artist A'), ('b', 'Artist B');
    INSERT INTO _TrackToArtist VALUES ('duet','a'), ('duet','b');
    INSERT INTO HistoryEvent VALUES ('h', 'Archived album', 'Archived artist');
  `);
  const add = (
    track: string,
    ts: string,
    ms: number | null,
    history: string | null = null,
    user = "owner",
  ) => {
    db.run("INSERT INTO RecentTracks VALUES (?, ?, ?, ?, ?)", [
      user,
      track,
      ts,
      ms,
      history,
    ]);
  };
  const read = (year?: number) => {
    const query = new SQLiteSyncDialect().sqlToQuery(
      listeningStatsQuery("owner", year),
    );
    return calculateListeningStats(
      db
        .query(query.sql)
        .all(...(query.params as string[])) as ListeningStatsRow[],
    );
  };
  return { db, add, read };
}

describe("listening stats", () => {
  test("zero-duration imports stay zero and multiple artists do not multiply totals", () => {
    const { db, add, read } = fixture();
    try {
      add("duet", "2024-02-01T00:00:00.000Z", 0);
      add("duet", "2024-02-02T00:00:00.000Z", 60000);
      add("duet", "2024-02-03T00:00:00.000Z", null);
      expect(read()).toEqual({
        played: 3,
        minutes: 4,
        tracks: { Duet: 3 },
        albums: { Album: 3 },
        artists: { "Artist A": 3, "Artist B": 3 },
      });
    } finally {
      db.close();
    }
  });
  test("archive-only metadata contributes to album and artist stats", () => {
    const { db, add, read } = fixture();
    try {
      add("archive", "2013-08-01T00:00:00.000Z", 120000, "h");
      expect(read()).toEqual({
        played: 1,
        minutes: 2,
        tracks: { "Archived song": 1 },
        albums: { "Archived album": 1 },
        artists: { "Archived artist": 1 },
      });
    } finally {
      db.close();
    }
  });
  test("year range is UTC, lower-inclusive, upper-exclusive and account scoped", () => {
    const { db, add, read } = fixture();
    try {
      add("duet", "2023-12-31T23:59:59.999Z", 60000);
      add("duet", "2024-01-01T00:00:00.000Z", 60000);
      add("duet", "2024-12-31T23:59:59.999Z", 60000);
      add("duet", "2025-01-01T00:00:00.000Z", 60000);
      add("duet", "2024-06-01T00:00:00.000Z", 60000, null, "other");
      expect(read(2024).played).toBe(2);
      expect(read(2024).minutes).toBe(2);
      expect(read().played).toBe(4);
    } finally {
      db.close();
    }
  });
});

test("song and artist names cannot collide with object properties", () => {
  const result = calculateListeningStats([
    {
      name: "constructor",
      albumName: "__proto__",
      artistNames: '["toString"]',
      plays: 2,
      milliseconds: 60000,
    },
  ]);
  expect(result.tracks.constructor).toBe(2);
  expect(result.albums.__proto__).toBe(2);
  expect(result.artists.toString).toBe(2);
});
