import { Database } from "bun:sqlite";
import { beforeEach, expect, mock, test } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "../app/lib.server/db/schema";
import * as relations from "../app/lib.server/db/relations";

const sqlite = new Database(":memory:");
const directory = new URL("../app/lib.server/db/migrations/", import.meta.url);
for (const name of readdirSync(directory)
  .filter((name) => name.endsWith(".sql"))
  .sort()) {
  sqlite.exec(readFileSync(new URL(name, directory), "utf8"));
}
const db = drizzle(sqlite, { schema: { ...schema, ...relations } });
const send = mock(async () => {});
let page: { items: any[]; next: string | null; total: number };
const saved = mock(async (_options: unknown) => page);
const recent = mock(async () => ({ items: [] }));
const top = mock(async () => ({ items: [] }));
const stats = mock(async () => {});
const allStats = mock(async () => {});
const transform = mock(async (tracks: any[]) => {
  for (const track of tracks) {
    sqlite
      .query(
        "INSERT OR IGNORE INTO Track(id, uri, name, image, provider, explicit, link, duration) VALUES (?, ?, ?, '', 'spotify', 0, '', 0)",
      )
      .run(track.id, `spotify:track:${track.id}`, track.name);
  }
  return tracks.map((track) => track.id);
});
mock.module("cloudflare:workers", () => ({
  env: { DELIVERY_QUEUE: { send } },
}));
mock.module("../app/lib.server/services/db", () => ({ db }));
mock.module("../app/lib.server/services/sdk/spotify", () => ({
  getSpotifyClient: async () => ({
    track: { getUsersSavedTracks: saved },
    player: { getRecentlyPlayedTracks: recent },
    user: { getUserTopItems: top },
  }),
}));
mock.module("../app/lib.server/services/sdk/helpers/spotify", () => ({
  transformTracks: transform,
  transformArtists: async () => [],
}));
mock.module("../app/lib.server/services/scheduler/scripts/sync/stats", () => ({
  syncUserStats: stats,
  syncUserStatsAll: allStats,
}));
const {
  processInitialImport,
  getInitialImport,
  retryInitialImport,
  recoverInitialImports,
} = await import("../app/lib.server/services/scheduler/initial-import");

beforeEach(() => {
  sqlite.exec(
    "PRAGMA foreign_keys=OFF; DELETE FROM Sync; DELETE FROM InitialImport; DELETE FROM LikedTracks; DELETE FROM Track; DELETE FROM Provider; DELETE FROM Profile; DELETE FROM User; PRAGMA foreign_keys=ON;",
  );
  sqlite
    .query("INSERT INTO User(id, createdAt, updatedAt) VALUES ('new', '', '')")
    .run();
  sqlite
    .query(
      "INSERT INTO Profile(id, email, name, updatedAt) VALUES ('new', 'new@example.com', 'New', '')",
    )
    .run();
  sqlite
    .query("INSERT INTO InitialImport(userId, updatedAt) VALUES ('new', 0)")
    .run();
  for (const fn of [send, saved, recent, top, stats, allStats, transform])
    fn.mockClear();
  page = { items: [], next: null, total: 0 };
});

test("simultaneous duplicate messages run the stage once", async () => {
  await Promise.all([processInitialImport("new"), processInitialImport("new")]);
  expect(recent).toHaveBeenCalledTimes(1);
  expect((await getInitialImport("new"))?.stage).toBe("top");
  expect(send).toHaveBeenCalledTimes(1);
});

test("liked pagination continues beyond 10,000 and preserves Spotify dates", async () => {
  sqlite.exec(
    "UPDATE InitialImport SET stage='liked', offset=10000, imported=10000",
  );
  page = {
    items: [
      {
        track: { id: "saved", name: "Saved" },
        added_at: "2018-01-02T03:04:05Z",
      },
    ],
    next: "next",
    total: 10002,
  };
  await processInitialImport("new");
  expect(saved).toHaveBeenCalledWith({ limit: 50, offset: 10000 });
  expect(await getInitialImport("new")).toMatchObject({
    offset: 10001,
    imported: 10001,
    stage: "liked",
    status: "queued",
  });
  expect(sqlite.query("SELECT createdAt FROM LikedTracks").get()).toEqual({
    createdAt: "2018-01-02T03:04:05.000Z",
  });
});

test("failed page preserves checkpoint and retries before requiring manual resume", async () => {
  sqlite.exec(
    "UPDATE InitialImport SET stage='liked', offset=10000, imported=10000, attempts=4",
  );
  saved.mockImplementationOnce(async () => {
    throw new Error("Spotify unavailable");
  });
  await processInitialImport("new");
  expect(await getInitialImport("new")).toMatchObject({
    offset: 10000,
    imported: 10000,
    status: "failed",
    attempts: 5,
  });
  expect(send).not.toHaveBeenCalled();
  await retryInitialImport("new");
  expect(await getInitialImport("new")).toMatchObject({
    offset: 10000,
    status: "queued",
    attempts: 0,
  });
  expect(send).toHaveBeenCalledTimes(1);
});

test("transient failure schedules delayed retry without advancing", async () => {
  saved.mockImplementationOnce(async () => {
    throw new Error("Rate limited");
  });
  sqlite.exec("UPDATE InitialImport SET stage='liked'");
  await processInitialImport("new");
  expect(await getInitialImport("new")).toMatchObject({
    offset: 0,
    status: "queued",
    attempts: 1,
    stage: "liked",
  });
  expect(send).toHaveBeenCalledWith(
    { type: "initial-import", userId: "new" },
    { delaySeconds: 120 },
  );
  await processInitialImport("new");
  expect(saved).toHaveBeenCalledTimes(1);
});

test("final year completes once and duplicate completed messages are harmless", async () => {
  sqlite
    .query("UPDATE InitialImport SET stage='stats', year=?")
    .run(new Date().getUTCFullYear());
  await processInitialImport("new");
  await processInitialImport("new");
  expect((await getInitialImport("new"))?.status).toBe("complete");
  expect(stats).toHaveBeenCalledTimes(1);
  expect(send).not.toHaveBeenCalled();
});

test("cron recovers an expired worker lease", async () => {
  sqlite.exec(
    "UPDATE InitialImport SET status='running', lease='lost', updatedAt=0",
  );
  await recoverInitialImports();
  expect(send).toHaveBeenCalledTimes(1);
  await processInitialImport("new");
  expect((await getInitialImport("new"))?.stage).toBe("top");
});

test("empty saved library advances to statistics", async () => {
  sqlite.exec("UPDATE InitialImport SET stage='liked'");
  await processInitialImport("new");
  expect(await getInitialImport("new")).toMatchObject({
    stage: "stats",
    imported: 0,
    total: 0,
  });
});

test("top API error reaches coordinator and preserves failed stage", async () => {
  sqlite.exec("UPDATE InitialImport SET stage='top'");
  top.mockImplementationOnce(async () => {
    throw new Error("Spotify unavailable");
  });
  await processInitialImport("new");
  expect(await getInitialImport("new")).toMatchObject({
    stage: "top",
    attempts: 1,
  });
  expect(sqlite.query("SELECT state FROM Sync WHERE type='top'").get()).toEqual(
    { state: "failure" },
  );
});

test("recent API error is not mistaken for empty listening history", async () => {
  recent.mockImplementationOnce(async () => {
    throw new Error("Spotify unavailable");
  });
  await processInitialImport("new");
  expect(await getInitialImport("new")).toMatchObject({
    stage: "recent",
    attempts: 1,
  });
  expect(
    sqlite.query("SELECT state FROM Sync WHERE type='recent'").get(),
  ).toEqual({ state: "failure" });
});

test("database write failure does not advance the saved-page checkpoint", async () => {
  sqlite.exec("UPDATE InitialImport SET stage='liked'");
  page = {
    items: [
      {
        track: { id: "blocked", name: "Blocked" },
        added_at: "2018-01-01T00:00:00Z",
      },
    ],
    next: null,
    total: 1,
  };
  sqlite.exec(
    "CREATE TEMP TRIGGER fail_liked BEFORE INSERT ON LikedTracks BEGIN SELECT RAISE(FAIL, 'write failed'); END;",
  );
  try {
    await processInitialImport("new");
    expect(await getInitialImport("new")).toMatchObject({
      stage: "liked",
      offset: 0,
      imported: 0,
      attempts: 1,
    });
  } finally {
    sqlite.exec("DROP TRIGGER fail_liked");
  }
});

test("Spotify Retry-After controls the queued retry delay", async () => {
  sqlite.exec("UPDATE InitialImport SET stage='liked'");
  saved.mockImplementationOnce(async () => {
    throw { retryAfter: 300 };
  });
  await processInitialImport("new");
  expect(send).toHaveBeenCalledWith(
    { type: "initial-import", userId: "new" },
    { delaySeconds: 300 },
  );
});

test("HTTP rate limit headers survive the Spotify fetch wrapper", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = mock(
    async () =>
      new Response(
        JSON.stringify({ error: { status: 429, message: "Rate limited" } }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", "Retry-After": "300" },
        },
      ),
  ) as never;
  try {
    const { spotifyFetch } = await import(
      "../app/lib.server/sdk/spotify/fetch"
    );
    await expect(
      spotifyFetch("https://api.spotify.com/v1/me/tracks", { token: "test" }),
    ).rejects.toMatchObject({ retryAfter: 300 });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

let verifySignup: (args: any) => Promise<{ id: string }>;
mock.module("remix-auth-oauth2", () => ({
  OAuth2Strategy: class {
    constructor(_options: unknown, verify: typeof verifySignup) {
      verifySignup = verify;
    }
  },
}));
mock.module("../app/lib.server/sdk/spotify/endpoints/user", () => ({
  getUserProfile: async () => ({
    id: "spotify-new",
    email: "signup@example.com",
    display_name: "New",
    images: [],
  }),
}));
const batch = mock(async (queries: Array<{ run: () => unknown }>) =>
  sqlite.transaction(() => queries.map((query) => query.run()))(),
);
Object.assign(db, { batch });
const tokens = {
  accessToken: () => "test",
  refreshToken: () => "refresh",
  accessTokenExpiresInSeconds: () => 3600,
  tokenType: () => "Bearer",
};

test("first OAuth signup creates one atomic import job; subsequent login leaves completion intact", async () => {
  const { getSpotifyStrategy } = await import(
    "../app/lib.server/services/auth/spotify"
  );
  getSpotifyStrategy();
  const result = await verifySignup({ tokens });
  expect(batch).toHaveBeenCalledTimes(1);
  expect(batch.mock.calls[0][0]).toHaveLength(4);
  expect(await getInitialImport(result.id)).toMatchObject({
    status: "queued",
    stage: "recent",
  });
  expect(send).toHaveBeenCalledWith(
    { type: "initial-import", userId: result.id },
    { delaySeconds: 0 },
  );
  sqlite
    .query("UPDATE InitialImport SET status='complete' WHERE userId=?")
    .run(result.id);
  send.mockClear();
  expect(await verifySignup({ tokens })).toEqual(result);
  expect((await getInitialImport(result.id))?.status).toBe("complete");
  expect(send).not.toHaveBeenCalled();
});

test("failure to create initial job rolls back new account and sends no message", async () => {
  const { getSpotifyStrategy } = await import(
    "../app/lib.server/services/auth/spotify"
  );
  getSpotifyStrategy();
  sqlite.exec(
    "CREATE TEMP TRIGGER fail_job BEFORE INSERT ON InitialImport BEGIN SELECT RAISE(FAIL, 'write failed'); END;",
  );
  try {
    await expect(verifySignup({ tokens })).rejects.toThrow("write failed");
    expect(sqlite.query("SELECT count(*) AS n FROM Provider").get()).toEqual({
      n: 0,
    });
    expect(sqlite.query("SELECT count(*) AS n FROM User").get()).toEqual({
      n: 1,
    });
    expect(send).not.toHaveBeenCalled();
  } finally {
    sqlite.exec("DROP TRIGGER fail_job");
  }
});

test("empty top lists retain all three time ranges", async () => {
  sqlite.exec("UPDATE InitialImport SET stage='top'");
  await processInitialImport("new");
  expect((await getInitialImport("new"))?.stage).toBe("liked");
  expect(
    sqlite
      .query("SELECT count(*) AS n FROM TopTracks WHERE userId='new'")
      .get(),
  ).toEqual({ n: 3 });
  expect(
    sqlite
      .query("SELECT count(*) AS n FROM TopArtists WHERE userId='new'")
      .get(),
  ).toEqual({ n: 3 });
});
