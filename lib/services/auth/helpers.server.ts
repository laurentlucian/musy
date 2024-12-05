import { prisma } from "@lib/services/db.server";
import type { SessionTyped } from "@lib/services/session.server";

export async function migrateLegacySession(session?: SessionTyped) {
  if (!session) return null;
  const user = session.get("spotify:session");
  if (!user) return null;

  const spotifyId = user.user.id;

  const db = await prisma.user.findFirst({
    where: { providers: { some: { accountId: spotifyId } } },
  });

  if (db) {
    session.set("data", { id: db.id });
    session.unset("spotify:session");
  }

  return { session, userId: session.get("data")?.id };
}
