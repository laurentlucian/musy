import { Database } from "bun:sqlite";
import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import {
  deleteAccount,
  recoverArchiveCleanup,
} from "../app/lib.server/services/account-cleanup";

function fixture() {
  const db = new Database(":memory:");
  db.exec(`PRAGMA foreign_keys=ON;
    CREATE TABLE User(id TEXT PRIMARY KEY);
    CREATE TABLE Profile(id TEXT PRIMARY KEY REFERENCES User(id) ON DELETE RESTRICT);
    CREATE TABLE Playlist(id TEXT PRIMARY KEY,userId TEXT REFERENCES Profile(id) ON DELETE RESTRICT);
    CREATE TABLE PlaylistTrack(playlistId TEXT REFERENCES Playlist(id) ON DELETE RESTRICT);
    CREATE TABLE QueueGroup(id TEXT PRIMARY KEY,userId TEXT REFERENCES Profile(id) ON DELETE RESTRICT);
    CREATE TABLE QueueItem(id TEXT PRIMARY KEY,groupId TEXT REFERENCES QueueGroup(id) ON DELETE CASCADE,userId TEXT REFERENCES Profile(id) ON DELETE RESTRICT);
    CREATE TABLE _QueueItemDelivery(queueItemId TEXT REFERENCES QueueItem(id) ON DELETE CASCADE,userId TEXT REFERENCES Profile(id) ON DELETE CASCADE);
    CREATE TABLE _QueueGroupToUser(groupId TEXT REFERENCES QueueGroup(id) ON DELETE CASCADE,userId TEXT REFERENCES Profile(id) ON DELETE CASCADE);
    CREATE TABLE Sync(userId TEXT);
    INSERT INTO User VALUES ('a'),('b'); INSERT INTO Profile VALUES ('a'),('b');
    INSERT INTO Playlist VALUES ('p','a'); INSERT INTO PlaylistTrack VALUES ('p');
    INSERT INTO QueueGroup VALUES ('a-group','a'),('b-group','b');
    INSERT INTO QueueItem VALUES ('shared','b-group','a'),('owned','a-group','b');
    INSERT INTO _QueueItemDelivery VALUES ('shared','b'),('owned','a');
    INSERT INTO _QueueGroupToUser VALUES ('a-group','b'),('b-group','a');
    INSERT INTO Sync VALUES ('a'),('b');`);
  for (const table of [
    "Stats",
    "Provider",
    "LikedTracks",
    "RecentTracks",
    "Playback",
    "PlaybackHistory",
    "TopTracks",
    "TopArtists",
    "Top",
  ]) {
    db.exec(
      `CREATE TABLE ${table}(userId TEXT REFERENCES Profile(id) ON DELETE RESTRICT); INSERT INTO ${table} VALUES ('a'),('b');`,
    );
  }
  for (const table of [
    "HistoryEvent",
    "HistoryImport",
    "HistoryImportBatch",
    "AnalyticsYear",
    "ListeningTrackSummary",
    "ListeningDaySummary",
  ]) {
    db.exec(
      `CREATE TABLE ${table}(userId TEXT REFERENCES Profile(id) ON DELETE CASCADE); INSERT INTO ${table} VALUES ('a'),('b');`,
    );
  }
  db.exec(
    readFileSync(
      "app/lib.server/db/migrations/0019_account_cleanup.sql",
      "utf8",
    ),
  );
  const D1 = {
    prepare(sql: string) {
      return {
        bind(...values: any[]) {
          return {
            all: async () => ({ results: db.query(sql).all(...values) }),
            run: async () => db.query(sql).run(...values),
            execute: () => db.query(sql).run(...values),
          };
        },
      };
    },
    batch: async (statements: any[]) =>
      db.transaction(() => statements.map((s) => s.execute()))(),
  } as unknown as D1Database;
  return { db, D1 };
}

test("account deletion atomically removes dependencies and preserves other users", async () => {
  const { db, D1 } = fixture();
  await deleteAccount(D1, "a");
  expect(db.query("SELECT * FROM User").all()).toEqual([{ id: "b" }]);
  for (const table of ["Stats", "Sync", "HistoryEvent", "AnalyticsYear"])
    expect(db.query(`SELECT * FROM ${table}`).all()).toEqual([{ userId: "b" }]);
  expect(db.query("SELECT * FROM QueueItem").all()).toEqual([]);
  expect(db.query("SELECT * FROM _QueueItemDelivery").all()).toEqual([]);
  expect(db.query("SELECT * FROM _QueueGroupToUser").all()).toEqual([]);
  expect(db.query("PRAGMA foreign_key_check").all()).toEqual([]);
  expect(db.query("SELECT userId FROM ArchiveCleanup").all()).toEqual([
    { userId: "a" },
  ]);
});

test("unexpected restrictive dependency rolls back data and cleanup outbox", async () => {
  const { db, D1 } = fixture();
  db.exec(
    "CREATE TABLE Blocker(userId TEXT REFERENCES Profile(id) ON DELETE RESTRICT); INSERT INTO Blocker VALUES ('a')",
  );
  await expect(deleteAccount(D1, "a")).rejects.toThrow();
  expect(
    db.query("SELECT * FROM Provider WHERE userId='a'").all(),
  ).toHaveLength(1);
  expect(db.query("SELECT * FROM QueueItem").all()).toHaveLength(2);
  expect(db.query("SELECT * FROM ArchiveCleanup").all()).toHaveLength(0);
});

test("failed archive cleanup retries and recreated accounts are protected", async () => {
  const { db, D1 } = fixture();
  await deleteAccount(D1, "a");
  db.exec("UPDATE ArchiveCleanup SET retryAt=0");
  let fail = true;
  let calls = 0;
  const HISTORY_ARCHIVES = {
    list: async () => ({
      objects: [{ key: "users/a/history/one" }],
      truncated: false,
    }),
    delete: async () => {
      calls++;
      if (fail) throw new Error("offline");
    },
  } as unknown as R2Bucket;
  await recoverArchiveCleanup({ D1, HISTORY_ARCHIVES });
  expect(db.query("SELECT * FROM ArchiveCleanup").all()).toHaveLength(1);
  db.exec("UPDATE ArchiveCleanup SET retryAt=0; INSERT INTO User VALUES ('a')");
  await recoverArchiveCleanup({ D1, HISTORY_ARCHIVES });
  expect(calls).toBe(1);
  db.exec("DELETE FROM User WHERE id='a'");
  fail = false;
  await recoverArchiveCleanup({ D1, HISTORY_ARCHIVES });
  expect(calls).toBe(2);
  expect(db.query("SELECT * FROM ArchiveCleanup").all()).toHaveLength(0);
});
