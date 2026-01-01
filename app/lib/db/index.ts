import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as relations from "~/lib/db/relations";
import * as schema from "~/lib/db/schema";

function getDatabase() {
  return drizzle(env.D1, { schema: { ...schema, ...relations } });
}

export const db = getDatabase();
