import { readFileSync } from "node:fs";
import { analyticsRebuildStatements } from "../app/lib.server/services/analytics-query";
import { Database } from "bun:sqlite";
import { expect, test } from "bun:test";
import { SQLiteSyncDialect } from "drizzle-orm/sqlite-core";
import {
  dashboardQueries,
  summarizeDashboard,
  type DashboardTotals,
  type DashboardPeriod,
} from "../app/lib.server/services/dashboard-query";

test("dashboard isolates users and UTC years, retains zero durations and separates identities", () => {
  const db = new Database(":memory:");
  db.exec(`
    CREATE TABLE Profile(id TEXT PRIMARY KEY);
    INSERT INTO Profile VALUES ('owner'),('other');
    CREATE TABLE Track(id TEXT, name TEXT, duration INTEGER, albumId TEXT);
    CREATE TABLE Album(id TEXT, name TEXT);
    CREATE TABLE Artist(id TEXT, name TEXT);
    CREATE TABLE _TrackToArtist(trackId TEXT, artistId TEXT);
    CREATE TABLE HistoryEvent(id TEXT, userId TEXT, albumName TEXT, artistName TEXT);
    CREATE TABLE RecentTracks(userId TEXT, trackId TEXT, playedAt TEXT, msPlayed INTEGER, historyEventId TEXT);
    CREATE TABLE LikedTracks(userId TEXT, createdAt TEXT, action TEXT);
    INSERT INTO Track VALUES ('t1','Same',180000,'a'),('t2','Same',900000,NULL),('t3','Other',60000,NULL);
    INSERT INTO Album VALUES ('a','Same album');
    INSERT INTO Artist VALUES ('a1','Same artist'),('a2','Same artist');
    INSERT INTO _TrackToArtist VALUES ('t1','a1'),('t1','a2');
    INSERT INTO HistoryEvent VALUES ('h','owner','Same album','Archive artist');
    INSERT INTO RecentTracks VALUES
      ('owner','t1','2026-01-01T00:00:00Z',NULL,NULL),
      ('owner','t1','2026-01-02T00:00:00Z',0,NULL),
      ('owner','t2','2026-01-02T01:00:00Z',60000,'h'),
      ('owner','t3','2025-12-31T23:30:00-01:00',60000,NULL),
      ('other','t1','2026-01-01T00:00:00Z',999999,NULL),
      ('owner','t1','2027-01-01T00:00:00Z',999999,NULL);
    INSERT INTO LikedTracks VALUES ('owner','2026-01-01','liked'),('owner','2026-01-01','unliked'),('other','2026-01-01','liked');
  `);
  db.exec(
    readFileSync("app/lib.server/db/migrations/0018_analytics.sql", "utf8"),
  );
  for (const year of [2026, 2027]) {
    const statements = analyticsRebuildStatements();
    const bindings = [
      ["owner", year],
      [year, "owner", year],
      ["owner", year],
      [year, "owner", year],
      [1, "owner", year],
    ];
    db.transaction(() =>
      statements.forEach((q, i) => {
        db.run(q, bindings[i]);
      }),
    )();
  }
  const queries = dashboardQueries("owner", 2026);
  const read = (key: keyof typeof queries) => {
    const query = new SQLiteSyncDialect().sqlToQuery(queries[key]);
    return db.query(query.sql).all(...(query.params as string[]));
  };
  const totals = read("totals")[0] as DashboardTotals;
  expect(totals).toEqual({
    played: 4,
    minutes: 5,
    uniqueTracks: 3,
    uniqueArtists: 3,
    uniqueAlbums: 2,
    estimatedPlays: 1,
    unknownPlays: 0,
    liked: 1,
  });
  expect(read("topTracks")).toHaveLength(3);
  expect(read("topArtists")).toEqual([
    { id: "a1", name: "Same artist", plays: 2 },
    { id: "a2", name: "Same artist", plays: 2 },
    { id: null, name: "Archive artist", plays: 1 },
  ]);
  const summary = summarizeDashboard(
    totals,
    read("days") as DashboardPeriod[],
    read("hourly") as { key: string; plays: number }[],
    2026,
  );
  expect(summary.activeDays).toBe(2);
  expect(summary.longestStreak).toBe(2);
  expect(summary.repeatShare).toBe(25);
  expect(summary.monthly).toHaveLength(12);
  expect(summary.monthly[0].plays).toBe(4);
  expect(summary.hourly[0].plays).toBe(3);
  expect(summary.peakDay?.plays).toBe(2);
  expect(read("years")).toEqual(
    [{ year: 2027 }, { year: 2026 }].filter(
      (row) => row.year <= new Date().getUTCFullYear(),
    ),
  );
  const allTimeQuery = new SQLiteSyncDialect().sqlToQuery(
    dashboardQueries("owner", 0).totals,
  );
  expect(
    (
      db
        .query(allTimeQuery.sql)
        .get(...(allTimeQuery.params as string[])) as DashboardTotals
    ).played,
  ).toBe(5);
  db.close();
});

test("empty history and streak gaps produce finite derived values", () => {
  const totals = {
    played: 0,
    minutes: 0,
    uniqueTracks: 0,
    uniqueArtists: 0,
    uniqueAlbums: 0,
    estimatedPlays: 0,
    unknownPlays: 0,
    liked: 0,
  };
  const empty = summarizeDashboard(totals, [], [], 0);
  expect(empty.repeatShare).toBe(0);
  expect(empty.averageMinutes).toBe(0);
  expect(empty.peakDay).toBeNull();
  expect(empty.monthly).toEqual([]);
  expect(empty.weekdays).toHaveLength(7);
  expect(empty.hourly).toHaveLength(24);
  expect(
    summarizeDashboard(
      totals,
      ["2024-02-28", "2024-02-29", "2024-03-01", "2024-03-03"].map((key) => ({
        key,
        plays: 1,
        minutes: 1,
      })),
      [],
      0,
    ).longestStreak,
  ).toBe(3);
});

test("all-time trend includes silent months across year boundaries", () => {
  const totals = {
    played: 2,
    minutes: 2,
    uniqueTracks: 1,
    uniqueArtists: 0,
    uniqueAlbums: 0,
    estimatedPlays: 0,
    unknownPlays: 0,
    liked: 0,
  };
  const result = summarizeDashboard(
    totals,
    [
      { key: "2024-12-31", plays: 1, minutes: 1 },
      { key: "2025-02-01", plays: 1, minutes: 1 },
    ],
    [],
    0,
  );
  expect(result.monthly).toEqual([
    { key: "2024-12", plays: 1, minutes: 1 },
    { key: "2025-01", plays: 0, minutes: 0 },
    { key: "2025-02", plays: 1, minutes: 1 },
  ]);
});
