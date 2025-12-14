import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "~/lib/db/schema";

function getDatabase() {
  return drizzle(env.D1, { schema, casing: "snake_case" });
}

export const db = getDatabase();
