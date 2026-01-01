import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as relations from "~/lib.server/db/relations";
import * as schema from "~/lib.server/db/schema";

function getDatabase() {
  return drizzle(env.D1, { schema: { ...schema, ...relations } });
}

export const db = getDatabase();
