import { and, eq, ne, or, sql } from "drizzle-orm";
import { data } from "react-router";
import { db } from "~/lib.server/db";
import { profile, user } from "~/lib.server/db/schema";

const reserved = new Set([
  "repeating",
  "genres",
  "history",
  "liked",
  "playlists",
]);

export async function saveUsername(
  userId: string,
  raw: string,
): Promise<string | null> {
  const username = raw.trim().toLowerCase();
  if (!/^[a-z][a-z0-9_-]{2,29}$/.test(username)) {
    return "Use 3–30 letters, numbers, underscores or hyphens. Start with a letter.";
  }
  if (reserved.has(username)) return "Username unavailable.";
  const conflict = await db.query.user.findFirst({
    where: and(sql`lower(${user.id}) = ${username}`, ne(user.id, userId)),
    columns: { id: true },
  });
  if (conflict) return "Username unavailable.";
  try {
    const updated = await db
      .update(profile)
      .set({ username, updatedAt: new Date().toISOString() })
      .where(eq(profile.id, userId))
      .returning({ id: profile.id });
    return updated.length ? null : "Account not found.";
  } catch (error) {
    const message =
      error instanceof Error
        ? `${error.message} ${error.cause}`
        : String(error);
    if (/UNIQUE constraint failed: Profile.username/i.test(message))
      return "Username unavailable.";
    throw error;
  }
}

export async function resolveProfileId(
  value: string | undefined,
  currentUserId: string | null | undefined,
) {
  if (!value) return currentUserId;
  const matches = await db
    .select({ id: profile.id })
    .from(profile)
    .where(or(eq(profile.id, value), eq(profile.username, value.toLowerCase())))
    .orderBy(sql`${profile.id} = ${value} DESC`)
    .limit(1);
  if (!matches[0]) throw data(null, { status: 404 });
  return matches[0].id;
}
