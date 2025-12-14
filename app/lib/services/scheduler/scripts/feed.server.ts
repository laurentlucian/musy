import { eq, isNull } from "drizzle-orm";
import {
  feed,
  likedSongs,
  playlist,
  playlistTrack,
  recommended,
} from "~/lib/db/schema";
import { db } from "~/lib/services/db.server";
import { log } from "~/lib/utils";

export async function syncFeed() {
  log("starting...", "feed");

  const [liked, recommendedItems, playlistTracksData] = await Promise.all([
    db.select().from(likedSongs).where(isNull(likedSongs.feedId)),
    db.select().from(recommended).where(isNull(recommended.feedId)),
    db
      .select({
        id: playlistTrack.id,
        addedAt: playlistTrack.addedAt,
        playlistId: playlistTrack.playlistId,
        trackId: playlistTrack.trackId,
        userId: playlist.userId,
      })
      .from(playlistTrack)
      .innerJoin(playlist, eq(playlistTrack.playlistId, playlist.id))
      .where(isNull(playlistTrack.feedId)),
  ]);

  for (const item of liked) {
    const _feedId = await db.transaction(async (tx) => {
      const [newFeed] = await tx
        .insert(feed)
        .values({
          createdAt: item.createdAt,
          userId: item.userId,
        })
        .returning({ id: feed.id });

      await tx
        .update(likedSongs)
        .set({ feedId: newFeed.id })
        .where(eq(likedSongs.id, item.id));

      return newFeed.id;
    });
  }

  for (const item of recommendedItems) {
    const _feedId = await db.transaction(async (tx) => {
      const [newFeed] = await tx
        .insert(feed)
        .values({
          createdAt: item.createdAt,
          userId: item.userId,
        })
        .returning({ id: feed.id });

      await tx
        .update(recommended)
        .set({ feedId: newFeed.id })
        .where(eq(recommended.id, item.id));

      return newFeed.id;
    });
  }

  for (const item of playlistTracksData) {
    const _feedId = await db.transaction(async (tx) => {
      const [newFeed] = await tx
        .insert(feed)
        .values({
          createdAt: item.addedAt,
          userId: item.userId,
        })
        .returning({ id: feed.id });

      await tx
        .update(playlistTrack)
        .set({ feedId: newFeed.id })
        .where(eq(playlistTrack.id, item.id));

      return newFeed.id;
    });
  }

  if (liked.length > 0) {
    log(`liked items processed: ${liked.length}`, "feed");
  }

  if (recommended.length > 0) {
    log(`recommended items processed: ${recommended.length}`, "feed");
  }

  if (playlistTracks.length > 0) {
    log(`playlist tracks processed: ${playlistTracks.length}`, "feed");
  }

  log("completed", "feed");
}
