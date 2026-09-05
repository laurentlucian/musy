import { Database } from "bun:sqlite";
import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { SQLiteSyncDialect } from "drizzle-orm/sqlite-core";
import {
  analyticsNeedsRefresh,
  analyticsRebuildStatements,
} from "../app/lib.server/services/analytics-query";
import {
  dashboardSnapshotState,
  dashboardSnapshotPublish,
} from "../app/lib.server/services/dashboard-snapshot-query";
import { dashboardQueries } from "../app/lib.server/services/dashboard-query";

function fixture() {
  const db = new Database(":memory:");
  db.exec(`PRAGMA foreign_keys=ON;
    CREATE TABLE Profile(id TEXT PRIMARY KEY);
    CREATE TABLE Track(id TEXT PRIMARY KEY,name TEXT,duration INTEGER,albumId TEXT);
    CREATE TABLE Album(id TEXT PRIMARY KEY,name TEXT);
    CREATE TABLE Artist(id TEXT PRIMARY KEY,name TEXT);
    CREATE TABLE _TrackToArtist(trackId TEXT,artistId TEXT);
    CREATE TABLE HistoryEvent(id TEXT PRIMARY KEY,userId TEXT,artistName TEXT,albumName TEXT,rawJson TEXT);
    CREATE TABLE RecentTracks(id TEXT PRIMARY KEY,userId TEXT,trackId TEXT,playedAt TEXT,msPlayed INTEGER,historyEventId TEXT);
    CREATE TABLE LikedTracks(userId TEXT,createdAt TEXT,action TEXT);
    CREATE TABLE Stats(userId TEXT,year INTEGER,updatedAt TEXT);
    INSERT INTO Profile VALUES ('u'),('other');
    INSERT INTO Track VALUES ('t','Same name',60000,'a'),('different','Same name',120000,'b');
    INSERT INTO Album VALUES ('a','Same album'),('b','Same album');
    INSERT INTO Artist VALUES ('a','Same artist'),('b','Same artist');
    INSERT INTO _TrackToArtist VALUES ('t','a'),('different','b');`);
  db.exec(
    readFileSync("app/lib.server/db/migrations/0018_analytics.sql", "utf8"),
  );
  db.exec(
    readFileSync(
      "app/lib.server/db/migrations/0020_dashboard_snapshots.sql",
      "utf8",
    ),
  );
  db.exec(
    readFileSync(
      "app/lib.server/db/migrations/0021_dashboard_metadata_guards.sql",
      "utf8",
    ),
  );
  const refresh = (year: number, fail = false) =>
    db.transaction(() => {
      const params = [
        ["u", year],
        [year, "u", year],
        ["u", year],
        [year, "u", year],
        [1, "u", year],
      ];
      analyticsRebuildStatements().forEach((query, i) => {
        db.run(query, params[i]);
        if (fail && i === 2) throw new Error("interrupted");
      });
    })();
  const totals = (year: number) => {
    const query = new SQLiteSyncDialect().sqlToQuery(
      dashboardQueries("u", year).totals,
    );
    return db.query(query.sql).get(...(query.params as string[]));
  };
  return { db, refresh, totals };
}

test("retries, late corrections, year moves, deletion and exact all-time identities", () => {
  const { db, refresh, totals } = fixture();
  db.exec(`INSERT INTO RecentTracks VALUES
    ('1','u','t','2024-01-01',NULL,NULL),('2','u','t','2025-01-01',0,NULL),
    ('3','u','different','2025-02-01',NULL,NULL),('4','other','t','2025-01-01',NULL,NULL);`);
  refresh(2024);
  refresh(2025);
  refresh(2025);
  expect(totals(0)).toMatchObject({
    played: 3,
    uniqueTracks: 2,
    uniqueArtists: 2,
    uniqueAlbums: 2,
    minutes: 3,
  });
  db.exec("UPDATE RecentTracks SET msPlayed=180000 WHERE id='1'");
  expect(() => refresh(2024, true)).toThrow("interrupted");
  expect(totals(2024)).toMatchObject({ minutes: 1 });
  expect(
    db
      .query(
        "SELECT revision>publishedRevision AS dirty FROM AnalyticsYear WHERE userId='u' AND year=2024",
      )
      .get(),
  ).toEqual({ dirty: 1 });
  refresh(2024);
  expect(totals(2024)).toMatchObject({ minutes: 3 });
  db.exec("UPDATE RecentTracks SET playedAt='2025-03-01' WHERE id='1'");
  refresh(2024);
  refresh(2025);
  expect(totals(2024)).toMatchObject({ played: 0 });
  expect(totals(2025)).toMatchObject({ played: 3, minutes: 5 });
  db.exec("DELETE FROM RecentTracks WHERE id='3'");
  refresh(2025);
  expect(totals(0)).toMatchObject({
    played: 2,
    uniqueTracks: 1,
    uniqueArtists: 1,
    uniqueAlbums: 1,
  });
  db.exec("DELETE FROM Profile WHERE id='u'");
  expect(
    db.query("SELECT COUNT(*) AS n FROM ListeningTrackSummary").get(),
  ).toEqual({ n: 0 });
  db.close();
});

test("duration changes invalidate estimates; metadata names stay live", () => {
  const { db, refresh, totals } = fixture();
  db.exec(
    "INSERT INTO RecentTracks VALUES ('1','u','t','2024-01-01',NULL,NULL)",
  );
  refresh(2024);
  db.exec("UPDATE Track SET duration=120000 WHERE id='t'");
  refresh(2024);
  expect(totals(2024)).toMatchObject({ minutes: 2 });
  db.exec("UPDATE Track SET name='New name' WHERE id='t'");
  const query = new SQLiteSyncDialect().sqlToQuery(
    dashboardQueries("u", 2024).topTracks,
  );
  expect(db.query(query.sql).get(...(query.params as string[]))).toMatchObject({
    name: "New name",
  });
  expect(
    db
      .query(
        "SELECT revision=publishedRevision AS fresh FROM AnalyticsYear WHERE userId='u'",
      )
      .get(),
  ).toEqual({ fresh: 1 });
  db.close();
});

test("unknown durations remain distinct from measured zero", () => {
  const { db, refresh, totals } = fixture();
  db.exec(`UPDATE Track SET duration=0 WHERE id='t';
    INSERT INTO RecentTracks VALUES ('unknown','u','t','2024-01-01',NULL,NULL),
    ('zero','u','t','2024-01-02',0,NULL),('estimate','u','different','2024-01-03',NULL,NULL);`);
  refresh(2024);
  expect(totals(2024)).toMatchObject({
    played: 3,
    minutes: 2,
    unknownPlays: 1,
    estimatedPlays: 1,
  });
  db.close();
});

test("recovery includes published aggregates until annual and all-time Stats persist", () => {
  const { db, refresh } = fixture();
  db.exec(
    `INSERT INTO RecentTracks VALUES ('1','u','t','2024-01-01',NULL,NULL);`,
  );
  refresh(2024);
  for (const year of [0, 2024]) {
    const state = db.query(dashboardSnapshotState).get("u", year) as {
      currentRevision: string;
    };
    db.run(dashboardSnapshotPublish, [
      "u",
      year,
      state.currentRevision,
      "{}",
      1,
    ]);
  }
  const pending = () =>
    db
      .query(
        `SELECT year FROM AnalyticsYear WHERE userId='u' AND (${analyticsNeedsRefresh})`,
      )
      .all();
  expect(pending()).toEqual([{ year: 2024 }]);
  db.exec(
    "INSERT INTO Stats(userId,year,updatedAt) VALUES ('u',2024,'1970-01-01T00:00:00.002Z')",
  );
  expect(pending()).toEqual([{ year: 2024 }]);
  db.exec(
    "INSERT INTO Stats(userId,year,updatedAt) VALUES ('u',0,'1970-01-01T00:00:00.002Z')",
  );
  expect(pending()).toEqual([]);
  db.exec(
    "UPDATE Stats SET updatedAt='1970-01-01T00:00:00.000Z' WHERE year=2024",
  );
  expect(pending()).toEqual([{ year: 2024 }]);
  db.close();
});

test("dashboard snapshots publish atomically and invalidate for events, likes and metadata", () => {
  const { db, refresh } = fixture();
  db.exec(
    "INSERT INTO RecentTracks VALUES ('1','u','t','2024-01-01',NULL,NULL)",
  );
  refresh(2024);
  const state = () =>
    db.query(dashboardSnapshotState).get("u", 2024) as {
      currentRevision: string;
      sourceRevision: string | null;
      payload: string | null;
      dirty: number;
    };
  const original = state().currentRevision;
  db.exec(
    "UPDATE Track SET name=name,albumId=albumId; UPDATE Album SET name=name; UPDATE Artist SET name=name; UPDATE _TrackToArtist SET artistId=artistId",
  );
  expect(state().currentRevision).toBe(original);
  db.run(dashboardSnapshotPublish, ["u", 2024, original, '{"played":1}', 2]);
  expect(state()).toMatchObject({
    sourceRevision: original,
    payload: '{"played":1}',
    dirty: 0,
  });
  db.exec("UPDATE Track SET name='Renamed' WHERE id='t'");
  expect(state().currentRevision).not.toBe(original);
  db.run(dashboardSnapshotPublish, ["u", 2024, original, '{"played":999}', 3]);
  expect(state().payload).toBe('{"played":1}');
  const renamed = state().currentRevision;
  db.run(dashboardSnapshotPublish, [
    "u",
    2024,
    renamed,
    '{"played":1,"name":"Renamed"}',
    4,
  ]);
  expect(state().sourceRevision).toBe(renamed);
  db.exec("INSERT INTO LikedTracks VALUES ('u','2024-02-01','liked')");
  expect(state().currentRevision).not.toBe(renamed);
  db.exec("UPDATE RecentTracks SET msPlayed=0 WHERE id='1'");
  const dirty = state().currentRevision;
  db.run(dashboardSnapshotPublish, ["u", 2024, dirty, '{"played":999}', 5]);
  expect(state().payload).toBe('{"played":1,"name":"Renamed"}');
  refresh(2024);
  db.run(dashboardSnapshotPublish, [
    "u",
    2024,
    state().currentRevision,
    '{"played":1,"minutes":0}',
    6,
  ]);
  expect(state()).toMatchObject({
    payload: '{"played":1,"minutes":0}',
    dirty: 0,
  });
  expect(
    (db.query(dashboardSnapshotState).get("other", 2024) as { payload: null })
      .payload,
  ).toBeNull();
  db.close();
});

test("dashboard request reads snapshots only; background refresh skips fresh snapshots", async () => {
  const { getDashboardStore, refreshDashboardStore } = await import(
    "../app/lib.server/services/dashboard-store"
  );
  const { db, refresh } = fixture();
  db.exec(
    "INSERT INTO RecentTracks VALUES ('1','u','t','2024-01-01',NULL,NULL)",
  );
  refresh(2024);
  const calls: string[] = [];
  const prepare = (sql: string) => {
    let params: (string | number)[] = [];
    return {
      bind(...args: (string | number)[]) {
        params = args;
        return this;
      },
      async first() {
        calls.push(sql);
        return db.query(sql).get(...params);
      },
      async run() {
        calls.push(sql);
        return db.query(sql).run(...params);
      },
      execute() {
        calls.push(sql);
        return { results: db.query(sql).all(...params) };
      },
    };
  };
  const d1 = {
    prepare,
    async batch(statements: ReturnType<typeof prepare>[]) {
      return db.transaction(() => statements.map((s) => s.execute()))();
    },
  };
  expect(await getDashboardStore(d1 as never, "u", 2024)).toMatchObject({
    played: 0,
    pending: true,
  });
  expect(calls).toHaveLength(1);
  calls.length = 0;
  await refreshDashboardStore(d1 as never, "u", 2024);
  expect(await getDashboardStore(d1 as never, "u", 2024)).toMatchObject({
    played: 1,
    pending: false,
    uniqueTracks: 1,
  });
  calls.length = 0;
  await getDashboardStore(d1 as never, "u", 2024);
  expect(calls).toHaveLength(1);
  expect(calls[0]).not.toContain("ListeningTrackSummary");
  calls.length = 0;
  await refreshDashboardStore(d1 as never, "u", 2024);
  expect(calls).toHaveLength(1);
  db.close();
});
