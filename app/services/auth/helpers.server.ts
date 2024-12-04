import type { Session } from "react-router";
import { prisma } from "../db.server";
import { type SessionData, sessionStorage } from "../session.server";

export async function getUserFromRequest(request: Request) {
  let session = await sessionStorage.getSession(request.headers.get("cookie"));

  const newSession = await migrateLegacySession(session);
  if (newSession) session = newSession;

  const userId = session.get("data")?.id;

  return { userId, session, migrated: !!newSession };
}

export async function migrateLegacySession(
  session: Session<SessionData, SessionData>,
) {
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

  return session;
}
