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
const { getHistoryInsights, getLocationSongs, parseBounds, summarizeDevices } =
  await import("../app/lib.server/services/history-insights");
const { validCoordinates } = await import(
  "../app/lib.server/services/history-geolocation"
);

beforeEach(() => {
  sqlite.exec(
    "DELETE FROM HistoryEvent; DELETE FROM GeoIP; DELETE FROM HistoryGeoJob;",
  );
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
) {
  sqlite
    .query(
      "INSERT INTO HistoryEvent(id,userId,batchId,trackId,trackName,artistName,albumName,playedAt,msPlayed,ip,platform,rawJson) VALUES (?,?,'batch','track','Song','Artist','Album',?,?,?,?, '{}')",
    )
    .run(id, userId, "2020-01-01T00:00:00.000Z", ms, ip, "ios");
}

function location(ip: string, lat: number, lon: number) {
  sqlite
    .query(
      "INSERT INTO GeoIP(ip,latitude,longitude,city,status,updatedAt) VALUES (?,?,?,'City','located',0)",
    )
    .run(ip, lat, lon);
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

test("map bounds reject malformed and reversed areas; coordinates never fabricate zero", () => {
  for (const value of [",,,", "1,2,3", "-181,0,1,1", "0,3,1,2", "NaN,0,1,2"])
    expect(parseBounds(value)).toBeNull();
  expect(parseBounds("-120,30,-110,40")).toEqual([-120, 30, -110, 40]);
  expect(validCoordinates(null, 0)).toBe(false);
  expect(validCoordinates(0, 0)).toBe(true);
  expect(validCoordinates(100, 20)).toBe(false);
});

test("insights use actual time, keep unlocated events, and exclude another account", async () => {
  event("one", "owner", "1.1.1.1", 12000);
  event("two", "owner", null, 0);
  event("private", "other", "1.1.1.1", 999999);
  location("1.1.1.1", 30, -120);
  const result = await getHistoryInsights("owner");
  expect(result.listens).toBe(2);
  expect(result.msPlayed).toBe(12000);
  expect(result.located).toBe(1);
  expect(result.locations[0].listens).toBe(1);
  expect(JSON.stringify(result)).not.toContain("1.1.1.1");
});

test("selected area paginates every matching listen once and never exposes raw data", async () => {
  location("1.1.1.1", 30, -120);
  location("2.2.2.2", 40, 10);
  for (let i = 0; i < 63; i++) event(`row-${String(i).padStart(3, "0")}`);
  event("outside", "owner", "2.2.2.2");
  event("private", "other");
  const first = await getLocationSongs("owner", [-121, 29, -119, 31], 0);
  const second = await getLocationSongs("owner", [-121, 29, -119, 31], 1);
  expect(first.total).toBe(63);
  expect(first.songs.length).toBe(50);
  expect(second.songs.length).toBe(13);
  expect(
    new Set([...first.songs, ...second.songs].map((song) => song.id)).size,
  ).toBe(63);
  expect(JSON.stringify(first)).not.toContain("rawJson");
  expect(JSON.stringify(first)).not.toContain("1.1.1.1");
});

test("geolocation caches results and completes in bounded batches", async () => {
  const { startHistoryLocations, processHistoryLocations } = await import(
    "../app/lib.server/services/history-geolocation"
  );
  for (let i = 1; i <= 12; i++) event(`ip-${i}`, "owner", `1.1.1.${i}`);
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = (async () => {
    calls++;
    return Response.json({
      success: true,
      latitude: 30,
      longitude: -120,
      city: "City",
    });
  }) as typeof fetch;
  try {
    await startHistoryLocations("owner");
    await processHistoryLocations("owner");
    expect(calls).toBe(10);
    await processHistoryLocations("owner");
    expect(calls).toBe(12);
    await startHistoryLocations("owner");
    await processHistoryLocations("owner");
    expect(calls).toBe(12);
    expect(
      sqlite
        .query("SELECT status FROM HistoryGeoJob WHERE userId='owner'")
        .get(),
    ).toEqual({ status: "complete" });
  } finally {
    globalThis.fetch = original;
  }
});

test("provider daily limits persist retry time without exhausting attempts", async () => {
  const { startHistoryLocations, processHistoryLocations } = await import(
    "../app/lib.server/services/history-geolocation"
  );
  event("rate-limited");
  await startHistoryLocations("owner");
  sqlite.exec("UPDATE HistoryGeoJob SET attempts=4 WHERE userId='owner'");
  const original = globalThis.fetch;
  globalThis.fetch = (async () =>
    new Response("", {
      status: 429,
      headers: { "Retry-After": "86400" },
    })) as typeof fetch;
  try {
    await processHistoryLocations("owner");
    const job = sqlite
      .query(
        "SELECT status,attempts,retryAt FROM HistoryGeoJob WHERE userId='owner'",
      )
      .get() as { status: string; attempts: number; retryAt: number };
    expect(job.status).toBe("queued");
    expect(job.attempts).toBe(4);
    expect(job.retryAt).toBeGreaterThan(Date.now() + 86_000_000);
  } finally {
    globalThis.fetch = original;
  }
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
