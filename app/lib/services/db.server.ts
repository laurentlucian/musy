import type { InferSelectModel } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { db } from "~/lib/db";
import type { artist, playlist, profile, track, user } from "~/lib/db/schema";
import * as schema from "~/lib/db/schema";

// Re-export the database instance
export { db };

// Type definitions from Drizzle schema
export type Database = typeof db;

export type Track = InferSelectModel<typeof track>;
export type Artist = InferSelectModel<typeof artist>;
export type Playlist = InferSelectModel<typeof playlist>;
export type User = InferSelectModel<typeof user>;
export type Profile = InferSelectModel<typeof profile>;

// Function to create database instance (used in sync scripts)
export function createDatabase(env: { musy: D1Database }) {
  return drizzle(env.musy, { schema });
}
