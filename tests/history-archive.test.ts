import { Database } from "bun:sqlite";
import { expect, test } from "bun:test";
import {
  archiveHistoryChunk,
  readHistoryArchive,
  sha256,
} from "../app/lib.server/services/history-archive";

function setup(corrupt = false) {
  const db = new Database(":memory:");
  db.exec(
    "CREATE TABLE HistoryEvent(id TEXT PRIMARY KEY,userId TEXT,rawJson TEXT,archiveKey TEXT,archiveChecksum TEXT,archiveOffset INTEGER); CREATE INDEX HistoryEvent_unarchived_idx ON HistoryEvent(userId,id) WHERE archiveKey IS NULL",
  );
  db.query("INSERT INTO HistoryEvent(id,userId,rawJson) VALUES (?,?,?)").run(
    "one",
    "a",
    '{"track":"one"}',
  );
  db.query("INSERT INTO HistoryEvent(id,userId,rawJson) VALUES (?,?,?)").run(
    "two",
    "b",
    '{"track":"two"}',
  );
  const objects = new Map<string, string>();
  const env = {
    D1: {
      prepare(sql: string) {
        return {
          bind(...values: any[]) {
            return {
              all: async () => ({ results: db.query(sql).all(...values) }),
              execute: () => db.query(sql).run(...values),
            };
          },
        };
      },
      batch: async (statements: any[]) =>
        db.transaction(() => statements.map((s) => s.execute()))(),
    },
    HISTORY_ARCHIVES: {
      put: async (key: string, body: string) => {
        objects.set(key, body);
      },
      get: async (key: string) =>
        objects.has(key)
          ? { text: async () => (corrupt ? "corrupt" : objects.get(key)!) }
          : null,
    },
  } as unknown as { D1: D1Database; HISTORY_ARCHIVES: R2Bucket };
  return { db, env, objects };
}

test("archive backfill verifies recoverable data, isolates users, and resumes safely", async () => {
  const { db, env } = setup();
  expect(await archiveHistoryChunk(env, "a")).toBe(true);
  expect(await archiveHistoryChunk(env, "a")).toBe(false);
  const row = db
    .query("SELECT * FROM HistoryEvent WHERE userId='a'")
    .get() as any;
  expect(row.rawJson).toBe("");
  expect(
    await readHistoryArchive(env, "a", row.archiveKey, row.archiveChecksum),
  ).toEqual([{ id: "one", record: { track: "one" } }]);
  await expect(
    readHistoryArchive(env, "b", row.archiveKey, row.archiveChecksum),
  ).rejects.toThrow("owner");
  expect(
    db.query("SELECT rawJson FROM HistoryEvent WHERE userId='b'").get(),
  ).toEqual({ rawJson: '{"track":"two"}' });
});

test("failed verification retains the entire inline archive", async () => {
  const { db, env } = setup(true);
  await expect(archiveHistoryChunk(env, "a")).rejects.toThrow("verification");
  expect(
    db
      .query("SELECT rawJson,archiveKey FROM HistoryEvent WHERE userId='a'")
      .get(),
  ).toEqual({ rawJson: '{"track":"one"}', archiveKey: null });
});

test("archive checksums use SHA-256", async () => {
  expect(await sha256("abc")).toBe(
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  );
});

test("large chunks retain record offsets across bounded update groups", async () => {
  const { db, env } = setup();
  const insert = db.query(
    "INSERT INTO HistoryEvent(id,userId,rawJson) VALUES (?,?,?)",
  );
  for (let i = 0; i < 100; i++)
    insert.run(
      `large-${i}`,
      "a",
      JSON.stringify({ data: "é".repeat(5000), i }),
    );
  expect(await archiveHistoryChunk(env, "a")).toBe(true);
  const rows = db
    .query("SELECT * FROM HistoryEvent WHERE userId='a' ORDER BY id")
    .all() as any[];
  expect(rows).toHaveLength(101);
  const archive = (await readHistoryArchive(
    env,
    "a",
    rows[0].archiveKey,
    rows[0].archiveChecksum,
  )) as any[];
  for (const row of rows) {
    expect(row.rawJson).toBe("");
    expect(archive[row.archiveOffset].id).toBe(row.id);
  }
});

test("backfill does not clear data changed after the archive snapshot", async () => {
  const { db, env } = setup();
  const originalPut = env.HISTORY_ARCHIVES.put.bind(env.HISTORY_ARCHIVES);
  env.HISTORY_ARCHIVES.put = (async (...args: any[]) => {
    const result = await (originalPut as any)(...args);
    db.exec(
      `UPDATE HistoryEvent SET rawJson='{"changed":true}' WHERE userId='a'`,
    );
    return result;
  }) as typeof env.HISTORY_ARCHIVES.put;
  await archiveHistoryChunk(env, "a");
  expect(
    db
      .query("SELECT rawJson,archiveKey FROM HistoryEvent WHERE userId='a'")
      .get(),
  ).toEqual({ rawJson: '{"changed":true}', archiveKey: null });
});

test("archive update seeks only chunk IDs with a large user history", async () => {
  const { db, env } = setup();
  db.exec(
    "WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i+1 FROM n WHERE i<216774) INSERT INTO HistoryEvent(id,userId,rawJson) SELECT printf('%09d',i),'a','{}' FROM n",
  );
  const prepare = env.D1.prepare.bind(env.D1);
  let plan: any[] = [];
  env.D1.prepare = ((sql: string) => {
    if (sql.startsWith("UPDATE HistoryEvent")) {
      const statement = db.prepare(`EXPLAIN QUERY PLAN ${sql}`);
      plan = statement.all("key", "checksum", "[]", "a");
      statement.finalize();
    }
    return prepare(sql);
  }) as typeof env.D1.prepare;
  const started = performance.now();
  await archiveHistoryChunk(env, "a");
  console.log(
    `216,775-row archive chunk: ${Math.round(performance.now() - started)}ms`,
  );
  expect(plan[0].detail).toContain("SCAN a VIRTUAL TABLE");
  expect(plan[1].detail).toContain("sqlite_autoindex_HistoryEvent_1 (id=?)");
  expect(
    db
      .query(
        "SELECT COUNT(*) AS n FROM HistoryEvent WHERE archiveKey IS NOT NULL",
      )
      .get(),
  ).toEqual({ n: 500 });
});
