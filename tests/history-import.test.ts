import { Database } from "bun:sqlite";
import { beforeEach, expect, mock, test } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";

const sqlite = new Database(":memory:");
const directory = new URL("../app/lib.server/db/migrations/", import.meta.url);
for (const name of readdirSync(directory)
  .filter((name) => name.endsWith(".sql"))
  .sort())
  sqlite.exec(readFileSync(new URL(name, directory), "utf8"));
function prepare(sql: string) {
  let values: any[] = [];
  return {
    bind(...args: any[]) {
      values = args;
      return this;
    },
    async first() {
      return sqlite.query(sql).get(...values);
    },
    async run() {
      return sqlite.query(sql).run(...values);
    },
    execute() {
      return sqlite.query(sql).run(...values);
    },
  };
}
mock.module("cloudflare:workers", () => ({
  env: {
    DELIVERY_QUEUE: { send: async () => {} },
    D1: {
      prepare,
      async batch(statements: ReturnType<typeof prepare>[]) {
        return sqlite.transaction(() =>
          statements.map((statement) => statement.execute()),
        )();
      },
    },
  },
}));
const {
  importHistoryBatch,
  getHistoryImport,
  completeHistoryImport,
  normalizeHistoryRow,
  canonicalJson,
} = await import("../app/lib.server/services/history-import");
const row = {
  ts: "2020-01-01T12:00:00Z",
  ms_played: 12345,
  spotify_track_uri: "spotify:track:1234567890123456789012",
  master_metadata_track_name: "Song",
  master_metadata_album_artist_name: "Artist",
  platform: "iPhone",
  ip_addr: "192.0.2.1",
  conn_country: "US",
};
beforeEach(() => {
  sqlite.exec(
    "PRAGMA foreign_keys=OFF; DELETE FROM RecentTracks; DELETE FROM HistoryEvent; DELETE FROM HistoryImportBatch; DELETE FROM HistoryImport; DELETE FROM _TrackToArtist; DELETE FROM Track; DELETE FROM Artist; DELETE FROM Profile; DELETE FROM User; PRAGMA foreign_keys=ON;",
  );
  for (const id of ["a", "b"]) {
    sqlite.query("INSERT INTO User(id) VALUES (?)").run(id);
    sqlite
      .query("INSERT INTO Profile(id,email) VALUES (?,?)")
      .run(id, `${id}@test.local`);
  }
});
test("canonical fingerprints ignore key order and preserve platform and IP", () => {
  expect(canonicalJson({ b: 2, a: 1 })).toBe(canonicalJson({ a: 1, b: 2 }));
  expect(normalizeHistoryRow(row)).toMatchObject({
    ip: "192.0.2.1",
    platform: "iPhone",
    msPlayed: 12345,
  });
  expect(() => normalizeHistoryRow({ ...row, ms_played: -1 })).toThrow();
});
test("retry and reimport are idempotent while distinct simultaneous records survive", async () => {
  const first = await importHistoryBatch("a", "job", "0", [
    row,
    row,
    { ...row, platform: "Android" },
    { spotify_episode_uri: "episode" },
  ]);
  expect(first).toMatchObject({ imported: 2, duplicates: 1, skipped: 1 });
  expect(
    await importHistoryBatch("a", "job", "0", [
      row,
      row,
      { ...row, platform: "Android" },
      { spotify_episode_uri: "episode" },
    ]),
  ).toMatchObject({ imported: 2, duplicates: 1, skipped: 1 });
  expect(await importHistoryBatch("a", "job2", "0", [row])).toMatchObject({
    imported: 0,
    duplicates: 1,
  });
  expect(sqlite.query("SELECT COUNT(*) n FROM RecentTracks").get()).toEqual({
    n: 2,
  });
  expect(
    sqlite.query("SELECT rawJson FROM HistoryEvent LIMIT 1").get(),
  ).toEqual({ rawJson: canonicalJson(row) });
});
test("users own independent events and durable completion", async () => {
  await importHistoryBatch("a", "job", "0", [row]);
  await importHistoryBatch("b", "job", "0", [row]);
  await completeHistoryImport("a", "job");
  expect(await getHistoryImport("a")).toMatchObject({
    status: "processing",
    imported: 1,
  });
  expect(await getHistoryImport("b")).toMatchObject({
    status: "running",
    imported: 1,
  });
});
test("fresh progress reads recover committed batches and background completion", async () => {
  const { loader } = await import("../app/routes/resources/history-import");
  const readProgress = async () =>
    (await loader({ context: { get: () => "a" } } as any)).data.import;

  expect(await readProgress()).toBeNull();
  await importHistoryBatch("a", "job", "0", [row, row]);
  expect(await readProgress()).toMatchObject({
    jobId: "job",
    status: "running",
    imported: 1,
    duplicates: 1,
    skipped: 0,
  });

  await importHistoryBatch("a", "job", "1", [
    { ...row, ts: "2020-01-02T12:00:00Z" },
    { spotify_episode_uri: "episode" },
  ]);
  const counts = { imported: 2, duplicates: 1, skipped: 1 };
  expect(await readProgress()).toMatchObject({ ...counts, status: "running" });
  await completeHistoryImport("a", "job");
  expect(await readProgress()).toMatchObject({ ...counts, status: "processing" });
  expect(await getHistoryImport("a")).toMatchObject({
    ...counts,
    status: "processing",
  });

  sqlite
    .query("UPDATE HistoryImport SET status='complete' WHERE userId=? AND jobId=?")
    .run("a", "job");
  expect(await readProgress()).toMatchObject({ ...counts, status: "complete" });
  expect(await readProgress()).toEqual(await getHistoryImport("a"));
});
test("exact API overlap is attached, different simultaneous archive listens remain", async () => {
  await importHistoryBatch("b", "seed", "0", [row]);
  sqlite
    .query("INSERT INTO RecentTracks(userId,trackId,playedAt) VALUES (?,?,?)")
    .run("a", "1234567890123456789012", "2020-01-01T12:00:00.000Z");
  await importHistoryBatch("a", "job", "0", [row, { ...row, ms_played: 100 }]);
  expect(
    sqlite
      .query(
        "SELECT COUNT(*) n,SUM(msPlayed) total FROM RecentTracks WHERE userId='a'",
      )
      .get(),
  ).toEqual({ n: 2, total: 12445 });
});
test("a malformed row rejects the batch before writes", async () => {
  await expect(
    importHistoryBatch("a", "job", "0", [row, { ...row, ts: "bad" }]),
  ).rejects.toThrow();
  expect(sqlite.query("SELECT COUNT(*) n FROM HistoryEvent").get()).toEqual({
    n: 0,
  });
});

test("changed retry payload is rejected and concurrent retries count once", async () => {
  await Promise.all([
    importHistoryBatch("a", "job", "0", [row]),
    importHistoryBatch("a", "job", "0", [row]),
  ]);
  await expect(
    importHistoryBatch("a", "job", "0", [{ ...row, ms_played: 12 }]),
  ).rejects.toThrow("contents changed");
  expect(await getHistoryImport("a")).toMatchObject({
    imported: 1,
    duplicates: 0,
  });
  expect(sqlite.query("SELECT COUNT(*) n FROM RecentTracks").get()).toEqual({
    n: 1,
  });
});

test("endpoint requires login and same-origin POST, and scopes reads to the session", async () => {
  const { action, loader } = await import(
    "../app/routes/resources/history-import"
  );
  const context = (id: string | null) => ({ get: () => id });
  const request = (origin: string) =>
    new Request("https://musy.test/resources/history-import", {
      method: "POST",
      headers: { Origin: origin, "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "batch",
        jobId: "job",
        batchId: "0",
        rows: [row],
        userId: "b",
      }),
    });
  expect(
    (
      await action({
        context: context(null),
        request: request("https://musy.test"),
      } as any)
    ).init?.status,
  ).toBe(401);
  expect(
    (
      await action({
        context: context("a"),
        request: request("https://other.test"),
      } as any)
    ).init?.status,
  ).toBe(403);
  await action({
    context: context("a"),
    request: request("https://musy.test"),
  } as any);
  expect(await getHistoryImport("a")).toMatchObject({ imported: 1 });
  expect(await getHistoryImport("b")).toBeNull();
  expect((await loader({ context: context("b") } as any)).data).toEqual({
    import: null,
    error: null,
  });
});

test("API insert racing after archive import cannot recreate the same listen", async () => {
  await importHistoryBatch("a", "job", "0", [row]);
  sqlite
    .query(
      "INSERT OR IGNORE INTO RecentTracks(userId,trackId,playedAt) VALUES (?,?,?)",
    )
    .run("a", "1234567890123456789012", "2020-01-01T12:00:00.000Z");
  expect(
    sqlite.query("SELECT COUNT(*) n FROM RecentTracks WHERE userId='a'").get(),
  ).toEqual({ n: 1 });
  sqlite
    .query(
      "INSERT OR IGNORE INTO RecentTracks(userId,trackId,playedAt) VALUES (?,?,?)",
    )
    .run("b", "1234567890123456789012", "2020-01-01T12:00:00.000Z");
  expect(
    sqlite.query("SELECT COUNT(*) n FROM RecentTracks WHERE userId='b'").get(),
  ).toEqual({ n: 1 });
});

test("concurrent conflicting payloads reject one without writing its metadata", async () => {
  const results = await Promise.allSettled([
    importHistoryBatch("a", "job", "0", [row]),
    importHistoryBatch("a", "job", "0", [
      {
        ...row,
        spotify_track_uri: "spotify:track:2234567890123456789012",
        master_metadata_album_artist_name: "Other artist",
      },
    ]),
  ]);
  expect(
    results.filter((result) => result.status === "fulfilled"),
  ).toHaveLength(1);
  expect(results.filter((result) => result.status === "rejected")).toHaveLength(
    1,
  );
  expect(sqlite.query("SELECT COUNT(*) n FROM Track").get()).toEqual({ n: 1 });
  expect(sqlite.query("SELECT COUNT(*) n FROM Artist").get()).toEqual({ n: 1 });
  expect(sqlite.query("SELECT COUNT(*) n FROM HistoryEvent").get()).toEqual({
    n: 1,
  });
});
