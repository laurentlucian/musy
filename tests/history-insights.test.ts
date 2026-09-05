import { Database } from "bun:sqlite";
import { beforeEach, expect, mock, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { deviceLabel } from "../app/lib/device";
import * as schema from "../app/lib.server/db/schema";

const sqlite = new Database(":memory:");
const directory = new URL("../app/lib.server/db/migrations/", import.meta.url);
for (const name of readdirSync(directory)
  .filter((name) => name.endsWith(".sql"))
  .sort())
  sqlite.exec(readFileSync(new URL(name, directory), "utf8"));
const db = drizzle(sqlite, { schema });
mock.module("../app/lib.server/services/db", () => ({ db }));
mock.module("cloudflare:workers", () => ({
  env: { DELIVERY_QUEUE: { send: async () => {} } },
}));
const { getHistoryInsights, getLocationSongs, summarizeDevices } = await import(
  "../app/lib.server/services/history-insights"
);

beforeEach(() => {
  sqlite.exec("DELETE FROM HistoryEvent;");
  for (const id of ["owner", "other"]) {
    sqlite
      .query("INSERT OR IGNORE INTO User(id, updatedAt) VALUES (?, '')")
      .run(id);
    sqlite
      .query(
        "INSERT OR IGNORE INTO Profile(id, email, updatedAt) VALUES (?, ?, '')",
      )
      .run(id, `${id}@test.local`);
  }
});

function event(
  id: string,
  userId = "owner",
  ip: string | null = "1.1.1.1",
  ms = 30000,
  country: string | null = null,
) {
  sqlite
    .query(
      "INSERT INTO HistoryEvent(id,userId,batchId,trackId,trackName,artistName,albumName,playedAt,msPlayed,ip,platform,country,rawJson) VALUES (?,?,'batch','track','Song','Artist','Album',?,?,?,?,?, '{}')",
    )
    .run(id, userId, "2020-01-01T00:00:00.000Z", ms, ip, "ios", country);
}

test("device classification identifies verified models and does not guess generic iOS", () => {
  expect(deviceLabel("iOS 15.1.1 (iPhone14,2)")).toBe("iPhone 13 Pro");
  expect(deviceLabel("ios")).toBe("iOS · model unknown");
  expect(deviceLabel("Partner amazon_salmon Amazon;Echo_Dot;;")).toBe(
    "Amazon Echo Dot",
  );
  expect(deviceLabel(null)).toBe("Unknown device");
  expect(
    summarizeDevices([
      { platform: "OS X 10.14.6 [x86 8]", listens: 2, msPlayed: 12 },
      { platform: "osx", listens: 3, msPlayed: 10 },
    ]),
  ).toEqual([{ label: "Mac", listens: 5, msPlayed: 22 }]);
});

test("insights use actual time, keep unlocated events, and exclude another account", async () => {
  event("one", "owner", "1.1.1.1", 12000, "US");
  event("two", "owner", null, 0);
  event("private", "other", "1.1.1.1", 999999, "US");
  const result = await getHistoryInsights("owner");
  expect(result.listens).toBe(2);
  expect(result.msPlayed).toBe(12000);
  expect(result.located).toBe(1);
  expect(JSON.stringify(result)).not.toContain("1.1.1.1");
  const songs = await getLocationSongs("owner", 0);
  expect(songs.total).toBe(2);
  expect(JSON.stringify(songs)).not.toContain("rawJson");
  expect(JSON.stringify(songs)).not.toContain("1.1.1.1");
});

test("observed iPhone models use verified names; unknown identifiers stay explicit", () => {
  const examples = [
    ["iPhone4,1", "iPhone 4s"],
    ["iPhone5,2", "iPhone 5"],
    ["iPhone5,3", "iPhone 5c"],
    ["iPhone7,1", "iPhone 6 Plus"],
    ["iPhone9,1", "iPhone 7"],
    ["iPhone9,2", "iPhone 7 Plus"],
    ["iPhone10,3", "iPhone X"],
    ["iPhone11,6", "iPhone XS Max"],
    ["iPhone11,8", "iPhone XR"],
    ["iPhone13,3", "iPhone 12 Pro"],
    ["iPhone14,2", "iPhone 13 Pro"],
  ];
  for (const [identifier, name] of examples)
    expect(deviceLabel(`iOS 15.1 (${identifier})`)).toBe(name);
  expect(deviceLabel("iOS 15 (IPHONE14,2)")).toBe("iPhone 13 Pro");
  expect(deviceLabel("iOS 30 (iPhone99,1)")).toBe("iPhone · iPhone99,1");
  expect(deviceLabel("iOS 20 (iPad99,1)")).toBe("iPad · iPad99,1");
});

test("export countries locate listens without IP lookups and normalize country totals", async () => {
  event("us", "owner", null, 12000, "US");
  event("us-normalized", "owner", null, 8000, " us ");
  event("fr", "owner", null, 5000, "FR");
  event("unknown", "owner", null, 3000, "XX");
  event("reserved", "owner", null, 2000, "ZZ");
  event("missing", "owner", null, 1000);
  event("private", "other", null, 999999, "US");
  const result = await getHistoryInsights("owner");
  expect(result.listens).toBe(6);
  expect(result.located).toBe(3);
  expect(result.countries).toEqual([
    { code: "US", label: "United States", listens: 2, msPlayed: 20000 },
    { code: "FR", label: "France", listens: 1, msPlayed: 5000 },
  ]);
});

test("country filters paginate country-only listens and isolate accounts", async () => {
  for (let i = 0; i < 63; i++)
    event(
      `country-${String(i).padStart(3, "0")}`,
      "owner",
      null,
      1000,
      i % 2 ? " us " : "US",
    );
  event("outside", "owner", null, 1000, "FR");
  event("private", "other", null, 1000, "US");
  const first = await getLocationSongs("owner", 0, " us ");
  const second = await getLocationSongs("owner", 1, "US");
  expect(first.total).toBe(63);
  expect(second.total).toBe(63);
  expect(first.songs).toHaveLength(50);
  expect(second.songs).toHaveLength(13);
  const ids = [...first.songs, ...second.songs].map((song) => song.id);
  expect(new Set(ids).size).toBe(63);
  expect(ids).not.toContain("outside");
  expect(ids).not.toContain("private");
});

test("invalid country filters never fall back to all listens", async () => {
  event("us", "owner", null, 1000, "US");
  event("unknown", "owner", null, 1000, "XX");
  for (const country of ["XX", "ZZ", "", "USA"])
    expect(await getLocationSongs("owner", 0, country)).toEqual({
      total: 0,
      songs: [],
    });
});
