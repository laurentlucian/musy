import { eq } from "drizzle-orm";
import { provider, user } from "~/lib/db/schema";
import { db } from "~/lib/services/db.server";
import type { SessionTyped } from "~/lib/services/session.server";

export async function migrateLegacySession(session?: SessionTyped) {
  if (!session) return null;
  const userSession = session.get("spotify:session");
  if (!userSession) return null;

  const spotifyId = userSession.user.id;

  const dbUser = await db
    .select({ id: user.id })
    .from(user)
    .innerJoin(provider, eq(user.id, provider.userId))
    .where(eq(provider.accountId, spotifyId))
    .limit(1);

  if (dbUser.length > 0) {
    session.set("data", { id: dbUser[0].id });
    session.unset("spotify:session");
  }

  return { session, userId: session.get("data")?.id };
}
