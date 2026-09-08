import { Database } from "bun:sqlite";
import { beforeEach, expect, mock, test } from "bun:test";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "../app/lib.server/db/schema";

const sqlite = new Database(":memory:");
sqlite.exec(`CREATE TABLE User (id TEXT PRIMARY KEY);
CREATE TABLE Profile (id TEXT PRIMARY KEY, username TEXT, updatedAt TEXT);`);
// Apply the new index against a pre-existing profile table.
const migration = await Bun.file(
  "app/lib.server/db/migrations/0022_profile_username.sql",
).text();
sqlite.exec("ALTER TABLE Profile DROP COLUMN username");
sqlite.exec(migration);
const db = drizzle(sqlite, { schema });
mock.module("../app/lib.server/db", () => ({ db }));
const { saveUsername, resolveProfileId } = await import(
  "../app/lib.server/services/usernames"
);

beforeEach(() => {
  sqlite.exec("DELETE FROM Profile; DELETE FROM User;");
  for (const id of ["first-id", "second-id", "third-id"]) {
    sqlite.query("INSERT INTO User (id) VALUES (?)").run(id);
    sqlite.query("INSERT INTO Profile (id) VALUES (?)").run(id);
  }
});

test("normalizes usernames, preserves IDs and rejects duplicate claims", async () => {
  expect(await saveUsername("first-id", " Alice ")).toBeNull();
  expect(await resolveProfileId("ALICE", null)).toBe("first-id");
  expect(await resolveProfileId("first-id", null)).toBe("first-id");
  expect(await saveUsername("second-id", "alice")).toBe(
    "Username unavailable.",
  );
  expect(await saveUsername("first-id", "alice")).toBeNull();
  expect(await saveUsername("first-id", "new-name")).toBeNull();
  expect(await resolveProfileId("first-id", null)).toBe("first-id");
  expect(await resolveProfileId("new-name", null)).toBe("first-id");
});

test("rejects route names, invalid input and another account's ID", async () => {
  for (const name of [
    "history",
    "genres",
    "playlists",
    "liked",
    "repeating",
    "second-id",
    "ab",
    "1alice",
    "a/b",
    "a b",
    "a".repeat(31),
  ]) {
    expect(await saveUsername("first-id", name)).not.toBeNull();
  }
});

test("resolves own-profile routes and rejects unknown public profiles", async () => {
  expect(await resolveProfileId(undefined, "first-id")).toBe("first-id");
  expect(await resolveProfileId(undefined, null)).toBeNull();
  await expect(resolveProfileId("unknown", "first-id")).rejects.toMatchObject({
    init: { status: 404 },
  });
});
